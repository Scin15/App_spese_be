import prisma from "../prisma-client/prismaClient.js";

// funzione per la creazione nuovo record
const insertExpense = async (req, res) => {
  const newExpense = req.body;
  const currentDate = new Date().toJSON();
  console.log(`Inserimento nuova spesa: ${newExpense}`);

  console.log({
    data: {
      userid: req.userAuth,
      category_id: newExpense.category_id,
      date_create: currentDate,
      date_update: currentDate,
      amount: newExpense.amount,
      note: newExpense.note,
      date: new Date(newExpense.date).toJSON(),
      file: newExpense.file,
    },
  });

  // arriva un oggetto vuoto
  console.log(newExpense.file);

  try {
    const expense = await prisma.expense.create({
      data: {
        userid: newExpense.userid,
        category_id: newExpense.category_id,
        date_create: currentDate,
        date_update: currentDate,
        amount: newExpense.amount,
        note: newExpense.note,
        date: new Date(newExpense.date).toJSON(),
      },
    });

    res.status(200).send(expense);
  } catch (error) {
    res.status(500).send(`Errore nell'insermnento nuova spesa: ${error}`);
  }
};

// script per inserimento spese di test
// const currentDate = new Date().toJSON();
// for (let i = 0; i<=10000; i++) {
//   await prisma.expense.create({
//    data: {
//      userid : 29,
//      category_id : 1,
//      date_create : currentDate,
//      date_update : currentDate,
//      amount: Math.floor(Math.random() * 100),
//      note : "Spesa inserita in automatico 2",
//      date: new Date().toJSON(),
//      }
//  })
// }

// funzione per la lettura di tutte le spese
const readExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.findMany();
    res.status(200).send(expense);
  } catch (error) {
    res.status(500).send(`Errore nella lettura spese : ${error}`);
  }
};

// funzione per la lettura delle spese di un utente
const readUserExpense = async (req, res) => {
  try {
    console.log(req.params.id);
    console.log("User nella richiesta arrivata dal middleware:", req.userAuth);
    const expense = await prisma.expense.findMany({
      where: {
        userid: {
          equals: req.userAuth,
        },
      },
      include: {
        category: {
          select: {
            category: true,
          },
        },
      },
    });
    res.status(200).send(expense);
  } catch (error) {
    res.status(500).send(`Errore nella lettura spese : ${error}`);
  }
};

// funzione per la lettura delle categorie
const readCategory = async (req, res) => {
  try {
    const category = await prisma.category.findMany();
    res.status(200).send(category);
  } catch (error) {
    res.status(500).send(`Errore nella lettura spese : ${error}`);
  }
};

// funzione per l'update di una o più spese
const updateExpense = async (req, res) => {
  const currentExpense = req.body;
  const currentDate = new Date().toJSON();
  let expense;
  try {
    if (Array.isArray(currentExpense.id)) {
      expense = await prisma.expense.updateMany({
        where: {
          id: { in: currentExpense.id },
          userid: req.userAuth,
        },
        data: {
          category_id: currentExpense.category_id,
          date_update: currentDate,
          amount: currentExpense.amount,
          note: currentExpense.note,
          date: new Date(currentExpense.date).toJSON(),
        },
      });
    } else {
      expense = await prisma.expense.update({
        where: {
          id: currentExpense.id,
          userid: req.userAuth,
        },
        data: {
          category_id: currentExpense.category_id,
          date_update: currentDate,
          amount: currentExpense.amount,
          note: currentExpense.note,
          date: new Date(currentExpense.date).toJSON(),
        },
      });
    }
    res.status(200).send(expense);
  } catch (error) {
    res.status(500).send(`Errore nell'update della spesa: ${error}`);
  }
};

// funzione per l'update del budget utente
const updateBudget = async (req, res) => {
  const currentDate = new Date().toJSON();
  const budget = new Number(req.body.budget).valueOf();
  try {
    const userSettings = await prisma.user_settings.updateMany({
      where: {
        userid: {
          equals: req.userAuth,
        },
      },
      data: {
        date_update: currentDate,
        budget: budget,
      },
    });
    res.status(200).send(userSettings);
  } catch (error) {
    res.status(500).send(`Errore nell'update dell budget: ${error}`);
  }
};

// funzione per l'eliminazione di una o più spese
const deleteExpense = async (req, res) => {
  const currentExpense = req.body;
  let expense;
  try {
    if (Array.isArray(currentExpense.id)) {
      expense = await prisma.expense.deleteMany({
        where: {
          id: {
            in: currentExpense.id,
          },
          userid: {
            equals: req.userAuth,
          },
        },
      });
    } else {
      expense = await prisma.expense.delete({
        where: {
          id: currentExpense.id,
          userid: req.userAuth,
        },
      });
    }
    res.status(200).send(expense);
  } catch (error) {
    res.status(500).send(`Errore nell'eliminazione della spesa : ${error}`);
  }
};

// funzione per l'eliminazione di tutte le spese
const deleteExpenseAll = async (req, res) => {
  try {
    const expense = await prisma.expense.deleteMany();
    res.status(200).send(expense);
  } catch (error) {
    res
      .status(500)
      .send(`Errore nell'eliminazione di tutte le spese : ${error}`);
  }
};

const readUserKpi = async (req, res) => {
  try {
    console.log("Utente per la lettura dei kpi: ", req.userAuth);
    // cerco il totale delle spes per l'utente
    const { _sum } = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userid: {
          equals: req.userAuth,
        },
      },
    });

    // cerco la categoria in cui l'utente ha speso di più
    const maxCategory = await prisma.expense.groupBy({
      by: ["category_id"],
      where: {
        userid: {
          equals: req.userAuth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    maxCategory.sort((a, b) => b._sum.amount - a._sum.amount);

    // cerco il nome della categoria con l'id trovato

    const maxCategoryDesc = await prisma.category.findFirst({
      where: {
        id: {
          equals: maxCategory.length > 0 ? maxCategory[0].category_id : -1,
        },
      },
      select: {
        category: true,
      },
    });

    //cerco il budget dell'utente

    const budget = await prisma.user_settings.findFirst({
      where: {
        userid: {
          equals: req.userAuth,
        },
      },
      select: {
        budget: true,
      },
    });

    res.status(200).send({
      total: _sum.amount ? _sum.amount : 0,
      maxCategory: {
        id: maxCategory.length > 0 ? maxCategory[0].category_id : -1,
        desc: maxCategoryDesc ? maxCategoryDesc.category : "",
        amount: maxCategory.length > 0 ? maxCategory[0]._sum.amount : 0,
      },
      budget: budget.budget,
    });
  } catch (error) {
    res.status(500).send(`Errore nella lettura dei Kpi utente: ${error}`);
  }
};

const readUserStats = async (req, res) => {
  try {
    // leggo l'ammontare per categoria usando una query sql perchè Prisma non implementa l'inclusione dei campi con relazione (category nella taballa category) quando uso il metodo prisma.table.groupBy

    // capire se devo stare attento a possibile query injections

    // ricavo i dati aggregando anche su mese e anno
    const categoryMonthAmount = await prisma.$queryRaw`
    SELECT a.category_id,
      b.category,
      to_char(a.date, 'YYYY-MM') as yearMonth,
      SUM(a.amount) as amount
    FROM 
      expense a
    INNER JOIN 
      category b 
    ON 
      a.category_id = b.id
    WHERE 
      a.userid = ${req.userAuth}
    GROUP BY 
      a.category_id,
      b.category,
      yearMonth
    `;

    // // leggo l'ammontare per mese e categoria
    // const monthlyAmount = await prisma.$queryRaw`
    //   SELECT to_char(date, 'YYYY-MM') as yearMonth,
    //     SUM(amount) as amount
    //   FROM expense
    //   WHERE 
    //     userid = ${req.userAuth}
    //   GROUP BY
    //     yearMonth`;

    res.status(200).send({ categoryMonthAmount });
  } catch (error) {
    res
      .status(500)
      .send(`Errore nella lettura delle statistiche utente: ${error}`);
  }
};

// export delle funzioni per CRUD API
export {
  insertExpense,
  readExpense,
  readUserExpense,
  readCategory,
  updateExpense,
  updateBudget,
  deleteExpense,
  deleteExpenseAll,
  readUserKpi,
  readUserStats,
};
