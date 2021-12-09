const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const routes = express.Router();

routes.post("/login", (req, res) => {
    //autenticación
    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        let usuario = req.body.user;
        let cont = req.body.pass;
        console.log(usuario);
        console.log(cont);
        conn.query(
            "SELECT * FROM usuarios where usuario = ? ", [usuario],
            (err, rows) => {
                if (err) return res.send(err);
                console.log(rows[0].pass);
                let hashSave = rows[0].pass;

                bcrypt.compare(cont.toString(), hashSave, (err, coinciden) => {
                    if (err) {
                        console.log("Error comprobando:", err);
                    } else {
                        console.log("¿La contraseña coincide?: " + coinciden);
                        if (coinciden) {
                            jwt.sign({ user: rows }, "secretkey", (err, token) => {
                                res.json({
                                    token: token,
                                });
                            });
                        } else {
                            res.json({
                                token: false,
                            });
                        }
                    }
                });
            }
        );
    });
});

routes.post("/add", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            req.getConnection((err, conn) => {
                if (err) return res.send(err);

                var salt = bcrypt.genSaltSync(10);
                req.body.pass = bcrypt.hashSync(req.body.pass.toString(), salt);
                console.log(req.body);
                conn.query("INSERT INTO usuarios set ?", [req.body], (err, rows) => {
                    if (err) return res.send(err);

                    res.json(rows);
                });
            });
        }
    });
});

routes.put("/:id", verifyToken, (req, res) => {
    console.log(req.token);
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            console.log("Token no valido");
            res.json({
                token: false,
                message: "Token no valido",
            });
        } else {
            req.getConnection((err, conn) => {
                if (err) return res.send(err);

                var salt = bcrypt.genSaltSync(10);
                req.body.pass = bcrypt.hashSync(req.body.pass.toString(), salt);

                console.log(req.body);
                console.log(req.params.id);
                conn.query(
                    "UPDATE usuarios set ? WHERE id = ?", [req.body, req.params.id],
                    (err, rows) => {
                        if (err) return res.send(err);

                        res.json(rows);
                    }
                );
            });
        }
    });
});

routes.delete("/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            console.log("Token no valido");
            res.json({
                token: false,
                message: "Token no valido",
            });
        } else {
            req.getConnection((err, conn) => {
                if (err) return res.send(err);
                conn.query(
                    "DELETE FROM usuarios WHERE id = ?", [req.params.id],
                    (err, rows) => {
                        if (err) return res.send(err);

                        res.json(rows);
                    }
                );
            });
        }
    });
});

routes.get("/all", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            console.log("Token no valido");
            res.json({
                token: false,
                message: "Token no valido",
            });
        } else {
            req.getConnection((err, conn) => {
                if (err) return res.send(err);

                conn.query("SELECT * FROM usuarios", (err, rows) => {
                    if (err) return res.send(err);

                    res.json(rows);
                });
            });
        }
    });
});

routes.get("/:id", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            console.log("Token no valido");
            res.json({
                token: false,
                message: "Token no valido",
            });
        } else {
            req.getConnection((err, conn) => {
                if (err) return res.send(err);
                conn.query(
                    "SELECT * FROM usuarios WHERE id = ?", [req.params.id],
                    (err, rows) => {
                        if (err) return res.send(err);

                        res.json(rows);
                    }
                );
            });
        }
    });
});

routes.post("/posts", verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: "post fue creado",
                authData,
            });
        }
    });
});

//Authorization: Bearer <token>
function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);
    if (typeof bearerHeader !== "undefined") {
        const bearerToken = bearerHeader.split(" ")[1];
        console.log(bearerToken);
        req.token = bearerToken;
        next();
    } else {
        console.log("Token no valido");
        res.status(403).send({
            errorMessage: "Authorization required!",
        });
    }
}

module.exports = routes;