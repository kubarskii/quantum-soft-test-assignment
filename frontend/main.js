import './components/treeView.js';
import './components/controlCenter.js';
import './components/activityLog.js';
import './lib/reactiveElemet.js';
import './cachedTree.js';
import './DBTree.js';

const controlCenter = document.querySelector('control-center');
if (controlCenter) {
    controlCenter.title = 'Operations Console';
    controlCenter.accent = '#0a65ff';
    controlCenter.context = {
        environment: 'Production',
        region: 'eu-west-2',
        owner: 'Platform Squad',
        lastSync: '5 min ago'
    };
    controlCenter.filters = [
        { id: 'healthy', label: 'Healthy', active: true },
        { id: 'warning', label: 'Warning', active: true },
        { id: 'critical', label: 'Critical', active: true }
    ];
    controlCenter.items = [
        { id: 201, name: 'API Gateway', status: 'Healthy', owner: 'Ana', score: 96 },
        { id: 202, name: 'Billing Queue', status: 'Warning', owner: 'Sam', score: 74 },
        { id: 203, name: 'Auth Service', status: 'Critical', owner: 'Nia', score: 52 },
        { id: 204, name: 'Realtime Stream', status: 'Healthy', owner: 'Leo', score: 88 }
    ];
    controlCenter.alerts = [
        { id: 'alert-1', severity: 'warning', message: 'Billing Queue throughput dropped.' },
        { id: 'alert-2', severity: 'critical', message: 'Auth Service token errors rising.' }
    ];
}

const activityLog = document.querySelector('activity-log');
if (activityLog) {
    activityLog.title = 'Deployment Activity';
    activityLog.entries = [
        { id: 11, label: 'Hotfix rolled out', time: '3m ago', owner: 'Release Bot' },
        { id: 12, label: 'Scaling job completed', time: '12m ago', owner: 'Kai' },
        { id: 13, label: 'Incident review scheduled', time: '20m ago', owner: 'Avery' },
        { id: 14, label: 'Rollback validated', time: '25m ago', owner: 'Ops' }
    ];
    activityLog.limit = 2;
}
