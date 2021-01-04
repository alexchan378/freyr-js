/* eslint-disable max-classes-per-file */

const PythonInterop = require('./pyinterop');

const core = new PythonInterop();

class Dispatcher {
  #dispatch = async (root, path, ...args) => {
    let count = -1;
    [...args].reverse().some(item => ((count += 1), item !== undefined));
    return core.exec(`${root.map(item => `${item}:`).join('')}${path}`, ...args.slice(0, count || Infinity));
  };

  static get = (obj, ...root) => (...args) => obj.#dispatch(root, ...args);
}

class YouTube extends Dispatcher {
  #dispatcher = Dispatcher.get(this, 'youtube');

  lookup(id) {
    return this.#dispatcher('lookup', id);
  }
}

class YouTubeMusic extends Dispatcher {
  #dispatcher = Dispatcher.get(this, 'ytmusic');

  search(query, filter, limit, ignoreSpelling) {
    return this.#dispatcher('search', query, filter, limit, ignoreSpelling);
  }
}

const closeConnection = () => core.close();

module.exports = {YouTube, YouTubeMusic, closeConnection};

async function main() {
  // eslint-disable-next-line global-require
  const deferrable = require('./deferrable');

  await deferrable(async defer => {
    defer(closeConnection);

    const yt = new YouTube();
    console.log(await yt.lookup('cuxNuMDet0M'));

    const ytm = new YouTubeMusic();
    console.log(await ytm.search('Billie Eilish Therefore I Am'));
  });
}

if (require.main === module) main().catch(err => console.error('An error occurred\n', err));
