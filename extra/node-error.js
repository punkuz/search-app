export default class NodeError extends Error {
  constructor(code, message){
    super(message)
    this.code = code
  }
}