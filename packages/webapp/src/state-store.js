// import { Subject, Observable, isObservable, pipe } from '../node_modules/rxjs/dist/esm/'
// hacky import
import { toggleFullScreenBrowser } from './facade.js'

const { Subject } = window.rxjs
const { startWith, scan } = window.rxjs.operators

const initialState = {
  canFullScreen: window.innerHeight >= 768 && window.innerHeight < window.innerWidth, // TODO observe
  fullscreen: false,
  playlist: {
    playlist: [],
    index: 0,
  },
  track: {},
  page: '',
}

// private!
const action$ = new Subject()

export function createStore (initState = initialState) {
  const next = action$
    // .flatMap((action) => isObservable(action) ? action : Observable.from([action]))
    .pipe(startWith(initState))
    .pipe(scan(reducer))

  return next
}

export function actionCreator2 (func) {
  if (!func) {
    func = payload => ({payload})
  }
  const action = (...args) => {
    const actionObj = func.call(null, ...args)
    console.assert(actionObj.type === undefined, `must not have field .type set`)
    actionObj.type = func
    // push it to the stream
    action$.next(actionObj)
    return actionObj
  }

  return [action, func]
}

export const [setPlayList, SET_PLAYLIST] = actionCreator2((payload, index = 0) => ({
  playlist: Array.isArray(payload) ? payload.sort(() => Math.random() > 0.5 ? -1 : 1) : [],
  index,
}))

export const [setTrack, SET_TRACK] = actionCreator2((track) => {

  document.querySelector('.bgimg').style.backgroundImage = (track.coverImage) ? `url(${track.coverImage})` : ''
  if (track.meta && track.meta.coverCSS) {
    Object.entries(track.meta.coverCSS).forEach(([k,v]) => {
      document.querySelector('.bgimg').style[k] = v
    })
  }

  document.title = `${track.artist} - ${track.title} (at 320 radio)`

  return {
    track
  }
})

export const [skipTrack, SKIP_TRACK] = actionCreator2()

export const [setPage, SET_PAGE] = actionCreator2()

export function reducer(state, action) {
  // console.log(action.type, state, action)
  switch (action.type) {
    case SKIP_TRACK:
      state.playlist.index = action.payload
      return {
        ...state,
      }
    case SET_PLAYLIST:
      return {
        ...state,
        playlist: {
          playlist: action.playlist,
          index: action.index,
        }
      }
    case SET_PAGE:
      return {
        ...state,
        page: action.payload,
      }
    case SET_TRACK:
      return {
        ...state,
        track: action.track
      }
    case SET_FULLSCREEN:
      return {
      ...state,
      fullscreen: action.payload
    }
    default:
      return state
  }
}

// new actions add here
export const [toggleFullScreen, TOGGLE_FULLSCREEN] = actionCreator2(() => {
    toggleFullScreenBrowser()
      .then(res => setFullScreen(res))
    return {}
  }
)

export const [setFullScreen, SET_FULLSCREEN] = actionCreator2()

document.addEventListener('fullscreenerror', () => setFullScreen(!!document.fullscreenElement))
document.addEventListener('fullscreenchange', () => setFullScreen(!!document.fullscreenElement))
