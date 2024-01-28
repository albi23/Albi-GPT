const replace = require('replace-in-file');

const path = `dist/albi-gpt/browser/`;

const options = {
  files: path + 'index.html',
  from: /(src|href)="([a-zA-Z0-9.-]+(.js|.css))/g,
  to: (match) => {
    const matchParts = match.split("\"");
    return `${matchParts[0]}\"./../${path}${matchParts[1]}`
  },
};

replace(options)
  .then((results) => {
    console.log('Replacement results:', results);
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });
