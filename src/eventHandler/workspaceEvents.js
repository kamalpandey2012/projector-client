import { OPEN_FILE } from './eventTypes';
import Socket from '../Socket';

export const workspaceEvents = () => {
  Socket.catchEvent(OPEN_FILE, (data) => {

  })
}