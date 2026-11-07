export function createInMemoryD1(database) {
  return {
    prepare(query) {
      const statement = database.prepare(query);
      let values = [];

      const boundStatement = {
        bind(...parameters) {
          values = parameters;
          return boundStatement;
        },
        async run() {
          const result = statement.run(...values);
          return {
            success: true,
            meta: {
              changes: result.changes,
              last_row_id: result.lastInsertRowid,
            },
          };
        },
        async all() {
          return { results: statement.all(...values) };
        },
        async raw() {
          return statement.all(...values).map((row) => Object.values(row));
        },
      };

      return boundStatement;
    },
  };
}
