const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { ulid } = require('ulid');
const { faker } = require('@faker-js/faker');
require ('dotenv').config()
const fs = require('fs');
const path = require('path');

// Configure sua conexão aqui
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

async function cleanupTestData() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const query = `
      WITH usuarios_para_deletar AS (
        SELECT id FROM users WHERE email LIKE '%@enzo.dev'
      ),
      delete_links AS (
        DELETE FROM links
        WHERE user_id IN (SELECT id FROM usuarios_para_deletar)
      )
      DELETE FROM users
      WHERE id IN (SELECT id FROM usuarios_para_deletar);
    `;

        await client.query(query);

        await client.query('COMMIT');
        console.log('Usuários e links de teste removidos com sucesso.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao remover dados de teste:', err);
    } finally {
        client.release();
    }
}

async function seedUsers() {
    const client = await pool.connect();

    try {
        const TOTAL_USERS = 2000;
        const BATCH_SIZE = 100;
        const RAW_PASSWORD = 'pwd123';
        const hashedPassword = await bcrypt.hash(RAW_PASSWORD, 10);
        const csvRows = [['name', 'email', 'password']];

        console.log('Senha criptografada. Iniciando inserção...');

        await client.query('BEGIN');

        for (let i = 0; i < TOTAL_USERS; i += BATCH_SIZE) {
            const values = [];
            const placeholders = [];

            const batchCount = Math.min(BATCH_SIZE, TOTAL_USERS - i);

            for (let j = 0; j < batchCount; j++) {
                const idx = j * 4;
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const username = faker.internet
                    .username({ firstName, lastName })
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '_');

                const uniqueSuffix = ulid().slice(-6).toLowerCase();
                const email = `${username}_${uniqueSuffix}@enzo.dev`;
                const name = `${firstName} ${lastName}`;

                values.push(ulid(), name, email, hashedPassword);
                placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
                csvRows.push([name, email, RAW_PASSWORD]);
            }

            const query = `
                INSERT INTO users (id, name, email, password)
                VALUES ${placeholders.join(', ')}
            `;

            await client.query(query, values);

            console.log(`Inseridos ${Math.min(i + BATCH_SIZE, TOTAL_USERS)} / ${TOTAL_USERS} usuários...`);
        }

        await client.query('COMMIT');
        console.log(`✅ ${TOTAL_USERS} usuários inseridos com sucesso!`);

        // Gerar CSV
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const csvPath = path.resolve('users_seed.csv');
        fs.writeFileSync(csvPath, csvContent, 'utf-8');
        console.log(`📄 CSV gerado em: ${csvPath}`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao inserir usuários:', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { cleanupTestData, seedUsers }
