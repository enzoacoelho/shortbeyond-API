const { seedUsers } = require('../playwright/support/database');

seedUsers()
    .then(() => console.log('Concluído!'))
    .catch(err => console.log(err))
    .finally(() => process.exit());