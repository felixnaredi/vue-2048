<template>
  <div>
    <header>
      <h1>2048</h1>
    </header>
    <main>
      <table
        tabindex="-1"
        @keydown.left="moveLeft"
        @keydown.right="moveRight"
        @keydown.down="moveDown"
        @keydown.up="moveUp"
      >
        <tr v-for="y in Array(height).keys()" :key="y">
          <td
            v-for="x in Array(width).keys()"
            :key="x"
            :class="cellStyleForValue($store.getters.getCell({ y: y, x: x }).value)"
          >
            {{ $store.getters.getCell({ y: y, x: x }).value }}
          </td>
        </tr>
      </table>
    </main>
    <p>Click on the table and then use the arrow keys to move the cells.</p>
    <button @click="reset">Reset</button>
    <div id="score-board-container">
      <score-board id="score-board" />
    </div>
  </div>
</template>

<script>
import ScoreBoard from "./components/ScoreBoard.vue";

export default {
  name: "App",
  components: { ScoreBoard },
  computed: {
    height() {
      return this.$store.state.height;
    },
    width() {
      return this.$store.state.width;
    },
  },
  created() {
    this.reset();
  },
  methods: {
    reset() {
      this.$store.commit("empty");
      this.$store.dispatch("step");
      this.$store.dispatch("step");
    },
    async move(action) {
      if (await this.$store.dispatch(action)) {
        this.$store.dispatch("step");
      }
    },
    moveLeft() {
      this.move("moveLeft");
    },
    moveRight() {
      this.move("moveRight");
    },
    moveDown() {
      this.move("moveDown");
    },
    moveUp() {
      this.move("moveUp");
    },
    cellStyleForValue(value) {
      console.log(`cell-${value}`);
      return `cell-${value}`;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
main {
  display: flex;
  justify-content: center;
}
td {
  width: 64px;
  height: 64px;
  border: 1px solid rgb(180, 180, 180);
}
#score-board {
  width: 500px;
  margin-top: 1em;
}
#score-board-container {
  display: flex;
  justify-content: center;
}
.cell-1 {
  background-color: rgb(223, 234, 199);
}
.cell-2 {
  background-color: rgb(183, 228, 199);
}
.cell-4 {
  background-color: rgb(248, 211, 184);
}
.cell-8 {
  background-color: rgb(243, 173, 168);
}
.cell-16 {
  background-color: rgb(240, 145, 152);
}
.cell-32 {
  background-color: rgb(218, 181, 154);
}
.cell-64 {
  background-color: rgb(253, 240,205);
}
.cell-128 {
  background-color: rgb(223, 210, 179);
}
.cell-256 {
  background-color: rgb(154, 214, 228);
}
.cell-512 {
  background-color: rgb(190, 209, 196);
}
.cell-1024 {
  background-color: rgb(241, 216, 150);
}
.cell-2048 {
  background-color: rgb(215, 158, 79);
}
</style>
