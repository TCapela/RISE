const oracledb = require('oracledb');
const { COURSES } = require('./seed-courses-data');

async function main() {
  const connection = await oracledb.getConnection({
    user: 'rm554983',
    password: '191205',
    connectString: 'oracle.fiap.com.br:1521/ORCL'
  });

  const sql = `
    INSERT INTO TB_RISE_CURSO (
      NOME_CURSO,
      DESC_CURSO,
      LINK_CURSO,
      AREA_CURSO,
      ID_USUARIO
    )
    VALUES (
      :p_nome,
      :p_desc,
      :p_link,
      :p_area,
      :p_idUsuario
    )
  `;

const idUsuario = 1;

const binds = COURSES.map((course) => {
  return {
    p_nome: course.title,
    p_desc: course.description,
    p_link: course.fiapUrl,
    p_area: course.area,
    p_idUsuario: idUsuario
  };
});


  await connection.executeMany(sql, binds);
  await connection.commit();
  await connection.close();

  console.log('Cursos inseridos com sucesso!');
}

main().catch((err) => {
  console.error('Erro ao popular cursos:', err);
  process.exit(1);
});
