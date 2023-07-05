const Papa = require('papaparse')
const fs = require('fs')
const utils = require('./utils')
const reader = require('xlsx')


const { program } = require('commander');

program
  .option('--datafeeds')


// IL FILE SORGENTE NON DEVE AVERE NIENTE PRIMA DELLA RIGA DI INTESTAZIONE, QUINDI PULIRE QUELLO DI AMAZON
const sourceFile = reader.readFile('./data/source.xlsx')

const allowedAsinFilesDir = './data/allowedAsinFiles'
const pastRecapFilesDir = './data/pastRecaps'

const run = async () => {
  program.parse();
  const options = program.opts();

  console.log('Scanning source data...')
  let sourceData = []

  const sheets = sourceFile.SheetNames

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(
      sourceFile.Sheets[sourceFile.SheetNames[i]])
    temp.forEach((res) => {
      sourceData.push(res)
    })
  }


  const allowedFilePaths = utils.getFilesRecursively(allowedAsinFilesDir)
  const allowedPastRecapPaths = utils.getFilesRecursively(pastRecapFilesDir)


  let allowedAsins = []

  const pathsToScan = [...allowedFilePaths, ...allowedPastRecapPaths].filter(file => file.includes('.csv'))

  pathsToScan.forEach(filePath => {
    console.log(`Scanning: ${filePath}`);

    const fileContent = fs.readFileSync(filePath).toString()

    if (fileContent.includes('https://')) {
      // This is a recap
      const content = Papa.parse(fileContent)
      const recapAsins = content.data.map(row => row[0]).map(link => utils.findAsin(link))
      allowedAsins = [...allowedAsins, ...recapAsins]
    } else {
      allowedAsins = [...allowedAsins, ...fileContent.split('\n')]
    }

  });

  const uniqueAsins = [...new Set(allowedAsins)]

  const finalAsinFile = Papa.unparse(uniqueAsins.map(entry => ({ asin: entry })), { delimiter: '\t' })
  fs.writeFileSync('./final_asins_file.csv', finalAsinFile)


  const filteredSource = sourceData.filter(item => uniqueAsins.includes(item.asin));
  const finalFile = Papa.unparse(filteredSource, { delimiter: '\t' })
  fs.writeFileSync('./final_deals_file.csv', finalFile)
}

run()