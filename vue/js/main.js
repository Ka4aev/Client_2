Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        },
        columnIndex: {
            type: Number,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <div v-for="(task, index) in column.tasks" :key="index">
                <div v-if="task.editing">
                    <input v-model="task.title" placeholder="Введите заголовок" />
                    <ul>
                        <li v-for="(top, idx) in task.subtoped" :key="idx">
                            <input v-model="top.text" placeholder="Введите подзадачу" />
                        </li>
                    </ul>
                    <button @click="addSubtoped(idx)">Добавить</button>
                    <button @click="saveCard(index,idx)">Сохранить</button>
                </div>
                <div v-else>
                    <h3>{{ task.title }}</h3>
                    <ul>
                        <li v-for="(top, idx) in task.subtoped" :key="idx">
                            <input type="checkbox"> {{ top.text }}
                        </li>
                    </ul>
                </div>
            </div>
            <button @click="addCard">Добавить карточку</button>
        </div>
    `,
    methods: {
        addCard() {
            this.$emit('add-card', this.columnIndex);
        },
        saveCard(index) {
            this.column.tasks[index].editing = false;
        },
        addSubtoped(index ,idx) {
            this.column.tasks[index].subtoped.push({ text: '' });
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            {
                title: 'Новые',
                tasks: [
                    {
                        title: 'Стать котиком',
                        subtoped: [
                            { text: 'Переодеться' },
                            { text: 'Мяукнуть' }
                        ],
                        editing: false
                    }
                ]
            },
            { title: 'В процессе', tasks: [] },
            { title: 'Сделаны', tasks: [] }
        ]
    },
    methods: {
        addCard(columnIndex) {
            this.columns[columnIndex].tasks.push({
                title: '',
                subtoped: [{ text: '' }],
                editing: true
            });
        }
    }
});