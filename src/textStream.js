import { Transform } from 'stream';

export class TextStream extends Transform {
  constructor(options) {
    super(options);
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    console.log('-');
    this.buffer += chunk.toString();
    const lastIndex = Math.max(
      this.buffer.lastIndexOf(' '),
      this.buffer.lastIndexOf('\n')
    );
    if (lastIndex !== -1) {
      const chunkToProcess = this.buffer.slice(0, lastIndex);
      this.buffer = this.buffer.slice(lastIndex + 1);
      this.push(chunkToProcess);
    }
    //console.log('BUFFER NOW:', this.buffer);
    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      this.push(this.buffer);
    }
    callback();
  }
}
