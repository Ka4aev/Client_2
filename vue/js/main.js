Vue.component('card-component', {
    props: {
        card: {
            type: Object,
            required: true
        },
        cardIndex: {
            type: Number,
            required: true
        },
        isFirstColumnBlocked: {
            type: Boolean,
            default: false
        },
        columnIndex: {
            type: Number,
            required: false
        }
    },
    template: `
        <div class="card" :class="{ 'deadline': isDeadline }">
            <h3 v-if="!card.isEditing">{{ card.title }}</h3>
            <input 
                v-if="card.isEditing" 
                type="text" 
                class="input-text"
                v-model="card.newTitle" 
                placeholder="Введите название карточки"
            />
            
            <div>
                <div 
                    v-for="(task, index) in card.tasks" 
                    :key="index"
                    class="task">
                    <label>
                        <input 
                            type="checkbox" 
                            v-model="task.completed" 
                            :disabled="isFirstColumnBlocked || !!card.completedAt || task.isEditing || card.isEditing" 
                            @change="toggleTaskCompletion(cardIndex, index)">
                        <span v-if="!task.isEditing">{{ task.text }}</span>
                        <input 
                            v-if="task.isEditing" 
                            type="text" 
                            v-model="task.text" 
                            placeholder="Введите задачу"
                        />
                    </label>
                    <button v-if="task.isEditing" @click="saveTask(index)">Сохранить</button>
                </div>
            </div>

            <div v-if="card.isEditing">
                <label style="font-weight: 600; font-size: 17px">Дедлайн:</label>
                <input 
                    type="date" 
                    v-model="card.newDeadline" 
                    :min="minDate"
                />
            </div>

            <button v-if="canAddTask" @click="addTask">Добавить пункт</button>
            
            <button v-if="card.isEditing" @click="saveCard">Сохранить</button>
            <p v-if="card.completedAt">Завершено: {{ card.completedAt }}</p>
            <p v-if="card.deadline">Дедлайн: {{ formatDeadline(card.deadline) }}</p>
        </div>
    `,
    computed: {
        canAddTask() {
            return !this.card.completedAt && this.card.tasks.length < 5 && !this.isFirstColumnBlocked
        },
        isDeadline() {
            if (!this.card.deadline) return false;
            const deadlineDate = new Date(this.card.deadline);
            const now = new Date();
            const differentInDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            return differentInDays <= 2;
        },
        minDate() {
            return new Date().toISOString().split('T')[0];
        }
    },
    methods: {
        addTask() {
            this.card.tasks.push({ text: '', completed: false, isEditing: true })
        },
        saveTask(taskIndex) {
            this.card.tasks[taskIndex].isEditing = false
            this.saveData()
        },
        saveCard() {
            if (this.card.newTitle) {
                this.card.title = this.card.newTitle;
            }
            if (this.card.newDeadline) {
                this.card.deadline = this.card.newDeadline;
            }
            this.card.isEditing = false;
            this.saveData();
        },
        saveData() {
            this.$emit('save-data')
        },
        toggleTaskCompletion(cardIndex, taskIndex) {
            this.$emit('task-updated', cardIndex, taskIndex)
        },
        formatDeadline(date) {
            return new Date(date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }
})

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
        isFirstColumnBlocked: {
            type: Boolean,
            default: false
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}({{column.cards.length}})</h2>
            <card-component 
                v-for="(card, index) in column.cards"
                :key="card.id"
                :card="card"
                :cardIndex="index"
                :columnIndex="columnIndex"
                :is-first-column-blocked="isFirstColumnBlocked"
                @save-data="$emit('save-data')"
                @task-updated="$emit('task-updated', columnIndex, index)"></card-component>
            <button v-if="canAddCard" @click="$emit('add-card', columnIndex)">Добавить карточку</button>
        </div>
    `,
    computed: {
        canAddCard() {
            return this.columnIndex === 0 && this.column.cards.length < 3 && !this.isFirstColumnBlocked
        }
    }
})

const app = new Vue({
    el: '#app',
    data() {
        return {
            columns: JSON.parse(localStorage.getItem("columns")) || [
                {
                    title: "Новые",
                    cards: []
                },
                { title: "В процессе", cards: [] },
                { title: "Завершенные", cards: [] }
            ]
        }
    },
    computed: {
        isFirstColumnBlocked() {
            return this.columns[1].cards.length >= 5
        }
    },
    methods: {
        addCard(columnIndex) {
            const newCard = {
                id: Date.now(),
                title: '',
                tasks: [{ text: '', completed: false, isEditing: true }],
                completedAt: null,
                isEditing: true,
                newTitle: '',
                newDeadline: '',
                deadline: null
            }
            this.columns[columnIndex].cards.push(newCard)
            this.saveData()
        },
        addTask(columnIndex, cardIndex, text) {
            this.columns[columnIndex].cards[cardIndex].tasks.push({ text, completed: false })
            this.saveData()
        },
        updateColumns(columnIndex, cardIndex, taskIndex) {
            const tasks = this.columns[columnIndex].cards[cardIndex].tasks
            const completedTasks = tasks.filter(item => item.completed)
            const progress = completedTasks.length / tasks.length

            if (columnIndex === 0 && progress > 0.5 && this.columns[1].cards.length < 5) {
                this.moveCard(columnIndex, cardIndex, 1)
            } else if (progress === 1) {
                this.moveCard(columnIndex, cardIndex, 2)
            } else if (columnIndex === 1 && progress < 0.5) {
                this.moveCardBack(columnIndex, cardIndex, 0)
            }
            this.saveData()
        },
        moveCard(columnIndex, cardIndex, toIndex) {
            const [card] = this.columns[columnIndex].cards.splice(cardIndex, 1)
            if (toIndex === 2) card.completedAt = new Date().toLocaleString()
            this.columns[toIndex].cards.push(card)
            this.saveData()
        },
        moveCardBack(columnIndex, cardIndex, toIndex) {
            const [card] = this.columns[columnIndex].cards.splice(cardIndex, 1)
            card.completedAt = null
            this.columns[toIndex].cards.push(card)
            this.saveData()
        },
        saveData() {
            localStorage.setItem("columns", JSON.stringify(this.columns))
        }
    }
})