const initialTree = [{
    id: 1,
    value: 'Root',
    children: [
        {
            id: 2,
            value: 'Child1',
            children: []
        },
        {
            id: 3,
            value: 'Child2',
            children: [
                {
                    id: 4,
                    value: 'Grandchild1',
                    children: []
                },
                {
                    id: 5,
                    value: 'Grandchild2',
                    children: []
                },
                {
                    id: 6,
                    value: 'Grandchild3',
                    children: []
                },
                {
                    id: 7,
                    value: 'Grandchild4',
                    children: [
                        {
                            id: 13,
                            value: 'Grand-grandchild12',
                            children: [
                                {
                                    id: 16,
                                    value: 'GGgrandchild13',
                                    children: []
                                },
                                {
                                    id: 17,
                                    value: 'GGgrandchild14',
                                    children: []
                                },
                                {
                                    id: 18,
                                    value: 'GGgrandchild15',
                                    children: []
                                },
                            ]
                        },
                        {
                            id: 14,
                            value: 'Grand-grandchild12',
                            children: []
                        },
                        {
                            id: 15,
                            value: 'Grand-grandchild12',
                            children: []
                        },
                    ]
                },
            ]
        },
        {
            id: 8,
            value: 'Child3',
            children: [
                {
                    id: 9,
                    value: 'Grandchild9',
                    children: []
                },
                {
                    id: 10,
                    value: 'Grandchild10',
                    children: []
                },
                {
                    id: 11,
                    value: 'Grandchild11',
                    children: []
                },
                {
                    id: 12,
                    value: 'Grandchild12',
                    children: []
                },
            ]
        },
    ]
}]

module.exports = {
    initialTree
}