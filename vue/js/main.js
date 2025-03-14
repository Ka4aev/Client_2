Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        },
        columnIndex: {
            type: Number,
            required: true
        },
        locked: {
            type: Boolean,
            default: false
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
                            <input v-model="top.isChecked" type="checkbox" @change="updateTaskStatus(index)"> {{ top.text }} {{ top.isChecked }}
                        </li>
                    </ul>
                    <p v-if="task.completedDate">Завершено: {{ task.completedDate }}</p>
                </div>
            </div>
            <button v-if="!columnIndex && column.tasks.length < 3 && !locked" @click="addCard">Добавить карточку</button>
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
            if (this.column.tasks[index].subtoped.length < 5) {
                this.column.tasks[index].subtoped.push({ text: '', isChecked: false });
            }
        },
        updateTaskStatus(index) {
            this.$emit('update-task-status', this.columnIndex, index);
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { title: 'Новые', tasks: [] },
            { title: 'В процессе', tasks: [] },
            { title: 'Сделаны', tasks: [] }
        ]
    },
    methods: {
        addCard(columnIndex) {
            this.columns[columnIndex].tasks.push({
                title: '',
                subtoped: [{ text: '', isChecked: false }],
                editing: true
            });
            this.saveData();
        },
        updateTaskStatus(columnIndex, taskIndex) {
            const task = this.columns[columnIndex].tasks[taskIndex];
            const completedCount = task.subtoped.filter(top => top.isChecked).length;
            const totalCount = task.subtoped.length;
            const completionPercentage = (completedCount / totalCount) * 100;

            if (columnIndex === 0 && completionPercentage > 50) {
                if (this.columns[1].tasks.length < 5) {
                    this.moveTask(columnIndex, taskIndex, 1);
                } else {
                    this.lockFirstColumn();
                }
            } else if (columnIndex === 1 && completionPercentage === 100) {
                task.completedDate = new Date().toLocaleString();
                this.moveTask(columnIndex, taskIndex, 2);
            }
            this.saveData();
        },
        moveTask(fromColumnIndex, taskIndex, toColumnIndex) {
            const task = this.columns[fromColumnIndex].tasks.splice(taskIndex, 1)[0];
            this.columns[toColumnIndex].tasks.push(task);
        },
        lockFirstColumn() {
            this.columns[0].locked = true;
        },
        unlockFirstColumn() {
            this.columns[0].locked = false;
        },
        saveData() {
            localStorage.setItem('todoAppData', JSON.stringify(this.columns));
        },
        loadData() {
            const data = localStorage.getItem('todoAppData');
            if (data) {
                this.columns = JSON.parse(data);
            }
        }
    },
    computed: {
        isFirstColumnLocked() {
            return this.columns[1].tasks.length >= 5;
        }
    },
    mounted() {
        this.loadData();
    }
});