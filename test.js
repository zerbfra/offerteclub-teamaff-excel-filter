 const allowedAsinFiles = fs.readFileSync(categoriesFilePath)


    const dealsFile = fs.readFileSync(dealsFileCsv).toString()

    const csv = Papa.parse(dealsFile, { header: true, transformHeader: h => h.trim() })
    const rows = csv.data

    console.log('Deals totali', rows.length)
    const filteredDeals = rows.filter(row => {
        const includedCat = categories.includes(row['product_category'])
        const asinRating = parseFloat(row['asin_rating'].trim().replace(',', '.'))
        const ratingGraterThan4 = asinRating > 3

        return includedCat && ratingGraterThan4
    })
    console.log('Deals filtrati', filteredDeals.length)

    const fileRows = []
    if (useDatafeeds) {
        const chunkedDeals = clickhouse.chunk(filteredDeals, 10)
        let index = 0
        for (const chunk of chunkedDeals) {
            console.log(`Scanning chunk ${index}/${parseInt(filteredDeals.length / 10)}`)
            const chunkByAsin = clickhouse.keyBy(chunk, 'asin')
            const clickhouseData = await clickhouse.getResultsByAsinList(Object.keys(chunkByAsin))
            for (const chRow of clickhouseData) {
                const excelRow = chunkByAsin[chRow.asin]
                fileRows.push({
                    ...excelRow,
                    ...chRow
                })
            }
            index++
        }
    } else {
        let index = 0
        for (const row of filteredDeals) {
            index++
            console.log(`Scanning ${index}/${filteredDeals.length}`)
            try {

                const keepaData = await keepa(row['asin'])
                const keepaMin = keepaData.stats.min[0] ? keepaData.stats.min[0][1] / 100 : keepaData.stats.min[1][1] / 100
                const keepaLampoMin = keepaData.stats.min[8] ? keepaData.stats.min[8][1] / 100 : ''

                const minDeiMin = keepaLampoMin && keepaLampoMin < keepaMin ? keepaLampoMin : keepaMin
                fileRows.push({ ...row, keepa_min: keepaMin.toString().replace('.', ','), keepa_lampo: keepaLampoMin.toString().replace('.', ','), min_dei_min: minDeiMin.toString().replace('.', ',') })

            } catch (err) {
                console.log('Errore download dati', err, row['asin'])
            }
        }
    }

    const finalFile = Papa.unparse(fileRows, { delimiter: '\t' })
    fs.writeFileSync('./final_file.csv', finalFile)