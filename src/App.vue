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
        <tr
          v-for="y in Array(height).keys()"
          :key="y"
        >
          <td
            v-for="x in Array(width).keys()"
            :key="x"
          >
            {{ $store.getters.getCell({y: y, x: x}).value }}
          </td>
        </tr>
      </table>
    </main>
    <p>Click on the table and then use the arrow keys to move the cells.</p>
    <p>If no valid options are left, refresh the page.</p>
  </div>
</template>

<script>
/*
function Coord (y, x) {
  return { y: y, x: x }
}

function Cell (y, x, value) {
  return {
    coord: Coord(y, x),
    value: value
  }
}
*/

export default {
  name: 'App',
  computed: {
    height () {
      return this.$store.state.height
    },
    width () {
      return this.$store.state.width
    }
  },
  created () {
    this.$store.commit('empty')
    this.$store.dispatch('step')
  },
  methods: {
    move(action) {
      this.$store.dispatch(action).then((change) => {
        if (change) {
          this.$store.dispatch('step')
        }
      })
    },
    moveLeft () { this.move('moveLeft') },
    moveRight () { this.move('moveRight') },
    moveDown () { this.move('moveDown') },
    moveUp () { this.move('moveUp') }
  }
}
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
  border: 1px solid black;
}
</style>
