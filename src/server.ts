import app from './app'
import {config} from './config/config'

app.listen(config.PORT, () => {
    console.log(`Server runs on http://localhost:${config.PORT}`)
})