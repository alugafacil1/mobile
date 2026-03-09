import { EventEmitter } from 'eventemitter3';

// Singleton compartilhado entre MapScreen e HomeScreen
const locationFilterEmitter = new EventEmitter();

export default locationFilterEmitter;