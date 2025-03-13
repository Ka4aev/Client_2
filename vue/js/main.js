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
                    <input type="text" class="input-text" v-model="task.title" placeholder="Введите заголовок" />
                    <ul>
                        <li v-for="(top, idx) in task.subtoped" :key="idx">
                            <input v-model="top.text"  class="input-text" type="text" placeholder="Введите подзадачу" />
                        </li>
                    </ul>
                    <button style="margin-bottom: 10px" @click="addSubtoped(index)">Добавить</button>
                    <button @click="saveCard(index)">Сохранить</button>
                </div>
                <div v-else>
                    <h3>{{ task.title }}</h3>
                    <ul>
                        <li v-for="(top, idx) in task.subtoped" :key="idx">
                            <input v-model="top.isChecked" type="checkbox"> {{ top.text }} {{ top.isChecked }}
                        </li>
                    </ul>
                </div>
            </div>
            <button v-if="!columnIndex && column.tasks.length < 3" @click="addCard">Добавить карточку</button>
        </div>
    `,
    methods: {
        addCard() {
            this.$emit('add-card', this.columnIndex);
        },
        saveCard(index) {
            this.column.tasks[index].editing = false;
        },
        addSubtoped(index) {
            this.column.tasks[index].subtoped.push({ text: '', isChecked: false });
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { title: 'Новые', tasks: []  },
            { title: 'В процессе', tasks: [] },
            { title: 'Сделаны', tasks: [] }
        ]
    },
    methods: {
        addCard(columnIndex) {
            this.columns[columnIndex].tasks.push({
                title: '',
                subtoped: [{ text: '', isChecked: false  }],
                editing: true
            });
        }
    },
    computed: {
        // checkTask(columnIndex) {
        //     return this.columns[columnIndex].tasks.subtoped.some();
        // },
    }
});