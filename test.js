const unaPromesa = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('Salida 0')
        resolve('resolved')
    }, 300)
    console.log('Salida 1')
})

async function randomResponse() {
    console.log('Salida 2')
    const response = await unaPromesa
    console.log('Fin - ', response)
}

randomResponse()
console.log('Salida 3')