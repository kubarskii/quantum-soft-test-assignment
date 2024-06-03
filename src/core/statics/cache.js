'use strict';

const path = require('node:path');
const { EventEmitter } = require('node:events');
const fsp = require('fs').promises;

class Cache extends EventEmitter {
  #path = '';
  tree = {};

  static SCRIPT = Symbol('script');

  constructor(_path, application) {
    super();
    this.application = application;
    if (!_path) throw new Error('path is not defined');
    if (typeof _path !== 'string') throw new Error('path must be a string');
    if (!_path.length) throw new Error('path must be a non-empty string');
    if (_path.includes(' ')) throw new Error('path must not contain spaces');
    if (_path.split('/').some((item) => item.includes(' ')))
      throw new Error('path must not contain spaces');
    this.#path = _path;
  }

  async init() {
    await this.build();
    return this;
  }

  fromRelative(filePath) {
    const { path: pathName } = this;
    if (!pathName) this.application.logger
      .error('path is not defined, probably "fromRelative" method is called from abstract method');
    const basePath = pathName.split(path.sep).slice(0, -1).join(path.sep);
    return basePath + path.sep + filePath;
  }

  static async create(...args) {
    const instance = new this(...args);
    return instance.init();
  }
  /**
   * @abstract
   * @param targetPath
   * @param {string} route - route that should be updated
   */
  async update(targetPath) {
    this.application.watcher.watch(targetPath);
    try {
      const files = await fsp.readdir(targetPath, { withFileTypes: true });
      for (const file of files) {
        const { name } = file;
        if (name.startsWith('.eslint')) continue;
        const filePath = path.join(targetPath, name);
        if (file.isDirectory()) await this.update(filePath);
        else await this.change(filePath);
      }
    } catch (error) {
      const console = this.application.console || global.console;
      console.error(error.stack);
    }
  }

  /**
   * @abstract
   * @param {string} route - route to be deleted
   */
  delete(route) {
    throw new Error('delete method is not implemented.');
  }

  get path() {
    return this.#path;
  }

  get structure() {
    return new Proxy(this.tree, proxyHandlers);
  }


  /**
   * Asynchronously generates a map of the directory structure.
   * @param {string} dirPath - Path to the directory.
   * @returns {Promise<void>}
   */
  async generateFolderStructure(dirPath) {
    // dir path = /api/
    const items = await fsp.readdir(dirPath, { withFileTypes: true });
    for (const item of items) {
      const stat = await fsp.stat(dirPath);
      if (dirPath.startsWith('.')) continue;
      if (stat.isDirectory()) {
        const { name } = item;
        await this.generateFolderStructure(path.join(dirPath, name));
      } else {
        await this.load();
      }
    }
  }

  /**
   * Method that make a snapshot of the directory and stores it in the tree object
   * @private
   * @param {*} [pathFolder] - path of the folder to mapped
   * @param {*} [nextMap] - used for recursion
   */
  async build(pathFolder = this.path, nextMap) {
    const folderMap = nextMap || this.tree;
    const folderPath = path.normalize(pathFolder);
    const initialFolderName = path.basename(folderPath);
    const map = nextMap ? folderMap[initialFolderName] = {} : folderMap;
    const filterEmpty = (dirs) => dirs.filter(Boolean);
    let dir;
    try {
      dir = await fsp.readdir(folderPath).then(filterEmpty);
    } catch (error) {
      console.error(error.stack);
    }
    for (const item of dir) {
      const nextPath = path.join(folderPath, item);
      const isDirectory = (stat) => stat.isDirectory();
      const isDir = await fsp.stat(nextPath).then(isDirectory);
      if (isDir) {
        map[item] = {};
        await this.build(nextPath, map);
      } else {
        if (item.startsWith('.')) continue;
        const name = item.split('.').slice(0, -1).join('.');
        const data = { filename: item, path: nextPath };
        if (name) map[name] = { ...map[name] };
        if (this.prepare) {
          const prepared = await this.prepare(data);
          map[name] = prepared;
        }
      }
    }
    this.emit('loaded', this);
  }
}

module.exports = {
  Cache,
};
