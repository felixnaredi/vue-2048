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

/**
 * Coordinate in for a position in 2D space.
 *
 * @param {Number} y
 * @param {Number} x
 * @returns A `Coord` object.
 */
function Coord (y, x) {
  return { y: y, x: x }
}

/**
 * `Cell` is the data type that keeps the state for a single cell.
 *
 * TODO:
 *   It's not important that `mergeAtMoveCount` keeps track of the actual move count but should
 *   contain something unique enough so that the value produced by a move will never be equal
 *   to a cells `mergeAtMoveCount` (or whatever it will be called then) already present on the
 *   board.
 *
 * @param {Number} y
 * @param {Number} x
 * @param {Number} value Value of cell
 * @param {Number} mergedAtMoveCount Value of step counter when the cell might have been merged
 * @returns A `Cell` object.
 */
function Cell (y, x, value, mergedAtMoveCount) {
  return {
    coord: Coord(y, x),
    value: value,
    mergedAtMoveCount: mergedAtMoveCount
  }
}

function cellIsEmpty (cell) {
  return cell.value == null
}

const store = new Vuex.Store({
  state: {
    height: 4,
    width: 4,
    moveCounter: 0,
    table: [],
    stepConfig: {
      amount: 1,
      values: [1, 2]
    }
  },
  getters: {
    getCell: (state) => ({ y, x }) => {
      if (y < 0 || x < 0 || y >= state.height || x >= state.width) {
        return null
      }
      const cell = state.table[y][x]
      if (cell) {
        return Cell(y, x, cell.value, cell.mergedAtMoveCount)
      }
      return Cell(y, x, null, null)
    },
    getRow: (state, getters) => (y) => {
      return range(state.width).map((x) => getters.getCell(Coord(y, x)))
    },
    getColumn: (state, getters) => (x) => {
      return range(state.height).map((y) => getters.getCell(Coord(y, x)))
    },
    cells (state, getters) {
      return range(state.height).map((y) => getters.getRow(y)).flat()
    },
    nonEmptyCells (_, getters) {
      return getters.cells.filter((cell) => !cellIsEmpty(cell))
    },
    emptyCells (_, getters) {
      return getters.cells.filter(cellIsEmpty)
    },
    movedCell: (state, getters) => (cell, section, neighbourCoord) => {
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

      /*
       * The neighbours `mergedAtMoveCount` is checked to prevent it from being merged twice during
       * the same move.
       */
      if (neighbour.value === cell.value && neighbour.mergedAtMoveCount !== state.moveCounter) {
        neighbour.value *= 2
        neighbour.mergedAtMoveCount = state.moveCounter
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
    containsEqualCell: (_, getters) => ({ coord: { y, x }, value }) => {
      const { value: other } = getters.getCell(Coord(y, x))
      return value === other
    }
  },
  mutations: {
    empty (state) {
      state.table = []
      range(state.height).forEach(() => state.table.push(Array(state.width).fill(null)))
    },
    setCell ({ table }, { coord: { y, x }, value, mergedAtMoveCount }) {
      table[y][x] = { value: value, mergedAtMoveCount: mergedAtMoveCount }
    },
    incrementMoveCounter (state) {
      state.moveCounter += 1
    }
  },
  actions: {
    step ({ state, getters, commit }) {
      const { amount, values } = state.stepConfig

      range(amount).forEach(() => {
        const cell = sample(getters.emptyCells)
        if (cell) {
          const { y, x } = cell.coord
          commit('setCell', Cell(y, x, sample(values), null))
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
    async updateMove ({ commit, dispatch }, cells) {
      if (await Promise.all(cells
        .map((cell) => dispatch('insertCell', cell)))
        .then((results) => results.some(id))
      ) {
        commit('incrementMoveCounter')
        return true
      }
      return false
    },
    async moveRight ({ state, getters, dispatch }) {
      return dispatch('updateMove', (range(state.height).map(getters.movedRowRight)).flat())
    },
    async moveLeft ({ state, getters, dispatch }) {
      return dispatch('updateMove', (range(state.height).map(getters.movedRowLeft)).flat())
    },
    async moveDown ({ state, getters, dispatch }) {
      return dispatch('updateMove', (range(state.width).map(getters.movedColumnDown)).flat())
    },
    async moveUp ({ state, getters, dispatch }) {
      return dispatch('updateMove', (range(state.width).map(getters.movedColumnUp)).flat())
    }
  }
})

createApp(App).use(store).mount('#app')
