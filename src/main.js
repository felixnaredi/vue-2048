import { createApp } from 'vue'
import App from './App.vue'
import Vuex from 'vuex'

function id (x) {
  return x
}

function sample (array) {
  return array[Math.floor(Math.random() * array.length)]
}

function range (lower, upper) {
  if (upper == null) {
    return range(0, lower)
  }
  if (lower > upper) {
    return range(upper + 1, lower + 1).reverse()
  }
  const distance = upper - lower
  return Array.from(Array(distance).keys()).map((a) => a + lower)
}

function Coord (y, x) {
  return { y: y, x: x }
}

function Cell (y, x, value) {
  return {
    coord: Coord(y, x),
    value: value
  }
}

function cellIsEmpty ({ value }) {
  return value == null
}

const store = new Vuex.Store({
  state: {
    height: 4,
    width: 4,
    table: [],
    step: {
      amounts: [1],
      values: [1, 2]
    }
  },
  getters: {
    getCell: (state) => ({ y, x }) => {
      if (y < 0 || x < 0 || y >= state.height || x >= state.width) {
        return null
      }
      return Cell(y, x, state.table[y][x])
    },
    getRow: (state) => (y) => {
      return state.table[y].map((value, x) => Cell(y, x, value))
    },
    getColumn: (state) => (x) => {
      return range(state.height).map((y) => Cell(y, x, state.table[y][x]))
    },
    cells (state, getters) {
      return range(state.height).map((y) => getters.getRow(y)).flat()
    },
    emptyCells (_, getters) {
      return getters.cells.filter(cellIsEmpty)
    },
    movedCellRight: (_, getters) => (cell, row) => {
      const neighbour = row.find((other) => other.coord.x === cell.coord.x + 1)

      if (neighbour == null) {
        return row
      }

      if (neighbour.value == null) {
        neighbour.value = cell.value
        cell.value = null

        return getters.movedCellRight(neighbour, row)
      }

      if (neighbour.value === cell.value) {
        neighbour.value *= 2
        cell.value = null
      }

      return row
    },
    movedCellLeft: (_, getters) => (cell, row) => {
      const neighbour = row.find((other) => other.coord.x === cell.coord.x - 1)

      if (neighbour == null) {
        return row
      }

      if (neighbour.value == null) {
        neighbour.value = cell.value
        cell.value = null

        return getters.movedCellLeft(neighbour, row)
      }

      if (neighbour.value === cell.value) {
        neighbour.value *= 2
        cell.value = null
      }

      return row
    },
    movedCellDown: (_, getters) => (cell, column) => {
      const neighbour = column.find((other) => other.coord.y === cell.coord.y + 1)

      if (neighbour == null) {
        return column
      }

      if (neighbour.value == null) {
        neighbour.value = cell.value
        cell.value = null

        return getters.movedCellDown(neighbour, column)
      }

      if (neighbour.value === cell.value) {
        neighbour.value *= 2
        cell.value = null
      }

      return column
    },
    movedCellUp: (_, getters) => (cell, column) => {
      const neighbour = column.find((other) => other.coord.y === cell.coord.y - 1)

      if (neighbour == null) {
        return column
      }

      if (neighbour.value == null) {
        neighbour.value = cell.value
        cell.value = null

        return getters.movedCellUp(neighbour, column)
      }

      if (neighbour.value === cell.value) {
        neighbour.value *= 2
        cell.value = null
      }

      return column
    },
    movedRowRight: (state, getters) => (y) => {
      let row = getters.getRow(y)
      range(state.width - 1, -1).forEach((i) => { row = getters.movedCellRight(row[i], row) })
      return row
    },
    movedRowLeft: (state, getters) => (y) => {
      let row = getters.getRow(y)
      range(state.width).forEach((i) => { row = getters.movedCellLeft(row[i], row) })
      return row
    },
    movedColumnDown: (state, getters) => (x) => {
      let row = getters.getColumn(x)
      range(state.height - 1, -1).forEach((i) => { row = getters.movedCellDown(row[i], row) })
      return row
    },
    movedColumnUp: (state, getters) => (x) => {
      let row = getters.getColumn(x)
      range(state.height).forEach((i) => { row = getters.movedCellUp(row[i], row) })
      return row
    }
  },
  mutations: {
    empty (state) {
      state.table = []
      range(state.height).forEach(() => state.table.push(Array(state.width).fill(null)))
    }
  },
  actions: {
    setCell ({ state }, { coord: { y, x }, value }) {
      const table = state.table

      if (value === table[y][x]) {
        return false
      }

      state.table[y][x] = value
      return true
    },
    step ({ state, getters, dispatch }) {
      const { amounts, values } = state.step
      range(sample(amounts)).forEach(() => {
        const cell = sample(getters.emptyCells)
        if (cell) {
          const { y, x } = cell.coord
          dispatch('setCell', Cell(y, x, sample(values)))
        }
      })
    },
    async moveRight ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedRowRight(y))
        .flat()
        .map((cell) => dispatch('setCell', cell))
      ).then((results) => results.some(id))
    },
    async moveLeft ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedRowLeft(y))
        .flat()
        .map((cell) => dispatch('setCell', cell))
      ).then((results) => results.some(id))
    },
    async moveDown ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedColumnDown(y))
        .flat()
        .map((cell) => dispatch('setCell', cell))
      ).then((results) => results.some(id))
    },
    async moveUp ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedColumnUp(y))
        .flat()
        .map((cell) => dispatch('setCell', cell))
      ).then((results) => results.some(id))
    }
  }
})

createApp(App).use(store).mount('#app')
