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
    movedCell: (_, getters) => (cell, section, neighbourCoord) => {
      const neighbour = section.find((other) => {
        const { y: y1, x: x1 } = neighbourCoord(cell)
        const { y: y2, x: x2 } = other.coord
        return y1 === y2 && x1 === x2
      })

      if (neighbour == null) {
        return section
      }

      if (neighbour.value == null) {
        neighbour.value = cell.value
        cell.value = null

        return getters.movedCell(neighbour, section, neighbourCoord)
      }

      if (neighbour.value === cell.value) {
        neighbour.value *= 2
        cell.value = null
      }

      return section
    },
    movedCellRight: (_, getters) => (cell, row) => {
      return getters.movedCell(cell, row, ({ coord: { y, x } }) => Coord(y, x + 1))
    },
    movedCellLeft: (_, getters) => (cell, row) => {
      return getters.movedCell(cell, row, ({ coord: { y, x } }) => Coord(y, x - 1))
    },
    movedCellDown: (_, getters) => (cell, column) => {
      return getters.movedCell(cell, column, ({ coord: { y, x } }) => Coord(y + 1, x))
    },
    movedCellUp: (_, getters) => (cell, column) => {
      return getters.movedCell(cell, column, ({ coord: { y, x } }) => Coord(y - 1, x))
    },
    movedRowRight: (state, getters) => (y) => {
      let row = getters.getRow(y)
      range(state.width - 1, -1).forEach((i) => {
        row = getters.movedCellRight(row[i], row)
      })
      return row
    },
    movedRowLeft: (state, getters) => (y) => {
      let row = getters.getRow(y)
      range(state.width).forEach((i) => { row = getters.movedCellLeft(row[i], row) })
      return row
    },
    movedColumnDown: (state, getters) => (x) => {
      let column = getters.getColumn(x)
      range(state.height - 1, -1).forEach((i) => {
        column = getters.movedCellDown(column[i], column)
      })
      return column
    },
    movedColumnUp: (state, getters) => (x) => {
      let column = getters.getColumn(x)
      range(state.height).forEach((i) => { column = getters.movedCellUp(column[i], column) })
      return column
    },
    containsEqualCell: ({ table }) => ({ coord: { y, x }, value }) => {
      return table[y][x] === value
    }
  },
  mutations: {
    empty (state) {
      state.table = []
      range(state.height).forEach(() => state.table.push(Array(state.width).fill(null)))
    },
    setCell ({ table }, { coord: { y, x }, value }) {
      table[y][x] = value
    }
  },
  actions: {
    step ({ state, getters, commit }) {
      const { amounts, values } = state.step

      range(amounts).forEach(() => {
        const cell = sample(getters.emptyCells)
        if (cell) {
          const { y, x } = cell.coord
          commit('setCell', Cell(y, x, sample(values)))
        }
      })
    },
    async insertCell ({ getters, commit }, cell) {
      if (getters.containsEqualCell(cell)) {
        return false
      }
      commit('setCell', cell)
      return true
    },
    async moveRight ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedRowRight(y))
        .flat()
        .map((cell) => dispatch('insertCell', cell))
      ).then((results) => results.some(id))
    },
    async moveLeft ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedRowLeft(y))
        .flat()
        .map((cell) => dispatch('insertCell', cell))
      ).then((results) => results.some(id))
    },
    async moveDown ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedColumnDown(y))
        .flat()
        .map((cell) => dispatch('insertCell', cell))
      ).then((results) => results.some(id))
    },
    async moveUp ({ state, getters, dispatch }) {
      return Promise.all(range(state.height)
        .map((y) => getters.movedColumnUp(y))
        .flat()
        .map((cell) => dispatch('insertCell', cell))
      ).then((results) => results.some(id))
    }
  }
})

createApp(App).use(store).mount('#app')
