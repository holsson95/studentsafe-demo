const bcrypt = require('bcrypt');

(async () => {
    const plainPassword = 'password12';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Hashed password:', hashedPassword);
})();