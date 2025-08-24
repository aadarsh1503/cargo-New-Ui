const bcrypt = require('bcryptjs');

const plainPassword = 'SecureAdminPassword123'; // Choose a strong password

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) throw err;
    console.log('Use this hash in your SQL INSERT statement:');
    console.log(hash);
  });
});