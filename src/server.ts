import app from './app'
import connectDB from './config/db'
import {config} from './config/config'


connectDB().then(() => {
    app.listen(config.PORT, () => {
        console.log(`Server runs on http://localhost:${config.PORT}`)
    })
}).catch(() => {
    "Databese couldn't start"
})
