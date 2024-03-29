const express = require("express");
const router = express.Router();
const cuid = require("cuid");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// console.log(cuid.slug());
router.post("/register", async (req, res) => {
  const { email, phoneno, name, role, password, city, price, experience, dob } =
    req.body; // Needed data
  // console.log(email,phoneno,name,role,password,city ); //check
  const uqId = cuid.slug();
  const uqId1 = cuid.slug();
  //

  try {
    db.query(
      `select * from users where email = ? or phoneno = ?`,
      [email, phoneno],
      async (err, result) => {
        if (err) console.log(err);
        else {
          // console.log(result.length);
          if (result.length > 0) {
            return res.status(400).send({
              status: "error",
              msg: "User Data Already Exist !!!",
              class: "err",
            });
          }

          const hashpass = await bcryptjs.hash(password, 10);
          db.query(
            `insert into users(id,email,phoneno,name,role,password,city) values(?,?,?,?,?,?,?)`,
            [uqId, email, phoneno, name, role, hashpass, city],
            (err, result) => {
              if (err) console.log(err);
              else {
                if (role.trim() == "user") {
                  return res.send({
                    status: "noerror",
                    msg: "Registration Completed :)",
                    class: "noerr",
                  });
                } else {
                  const currentDate = new Date();
                  const userDOB = new Date(dob);
                  const age = Math.floor(
                    (currentDate - userDOB) / (1000 * 60 * 60 * 24 * 365)
                  );
                  db.query(
                    `insert into workers(id,userId,price,age,experience,role,isVerified,plan,city) values(?,?,?,?,?,?,?,?,?)`,
                    [uqId1, uqId, price, age, experience, role, 0, "no", city],
                    (err, result) => {
                      if (err) console.log(err);
                      else {
                        return res.send({
                          status: "noerror",
                          msg: "Registration Completed :)",
                          class: "noerr",
                        });
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
    );
    // db.end();
  } catch (error) {
    return res.status(400).send({
      status: "error",
      msg: error,
      class: "err",
    });
  }
});

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  try {
    db.query(
      "select * from users where email = ? and role = ?",
      [email, role],
      async (err, result) => {
        if (err) console.log(err);
        else {
          // console.log(result);
          if (result.length == 0) {
            return res.status(400).send({
              status: "error",
              msg: "Email Doesn't Exist !!!",
              class: "err",
            });
          }
          const isValid = await bcryptjs.compare(password, result[0].password);
          if (!isValid) {
            return res.status(400).send({
              status: "error",
              msg: "Password Doesn't Match !!!",
              class: "err",
            });
          }

          //After Login

          const userdata = result[0];
          // console.log(userdata);
          const token = jwt.sign(
            { userdata: userdata },
            process.env.jwtSecretCode,
            {
              expiresIn: process.env.jwtExpireTime,
            }
          );

          const cookieExpire = {
            expires: new Date(
              Date.now() + process.env.jwtCookieExpire * 1000 * 60 * 60 * 24
            ),
            httpOnly: true,
            sameSite: "none",
            path: "/",
            secure: true,
          };

          res.cookie("servicifyCookie", token, cookieExpire);

          // console.log(req.cookies);
          console.log("done", result[0]);

          res.send({
            status: "noerror",
            msg: "Login Successful :)",
            data: result[0],
            class: "noerr",
          });
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
});

router.post("/updateLogin", async (req, res) => {
  const { id, email, phoneno, name, password, city } = req.body; // Needed data
  // console.log(id,email,phoneno,name,password ,city); //check
  try {
    const hashpass = await bcryptjs.hash(password, 10);
    db.query(
      "update users set email=?,phoneno=?,name=?,password=?,city=? where id =?",
      [email, phoneno, name, hashpass, city, id],
      (err, result) => {
        if (err) console.log(err);
        else {
          console.log(result);
          return res.send({
            status: "noerror",
            msg: "User Details Updated :)",
            class: "noerr",
          });
        }
      }
    );
    // db.end();
  } catch (error) {
    return res.status(400).send({
      status: "error",
      msg: error,
      class: "err",
    });
  }
});

router.get("/me", async (req, res) => {
  // res.send("work");
  try {
    const cookiee = req.cookies.servicifyCookie;

    if (cookiee) {
      const decodeData = await jwt.verify(cookiee, process.env.jwtSecretCode);

      var arole1 = "";

      const arole = decodeData.userdata.role;
      switch (arole) {
        case "user":
          arole1 = "users";
          break;
        case "painter":
          arole1 = "Paintersdata";
          break;
        case "designer":
          arole1 = "Designerdata";
          break;
        case "electrician":
          arole1 = "Electriciandata";
          break;
        case "packer":
          arole1 = "Packerdata";
          break;
        case "plumber":
          arole1 = "Plumberdata";
          break;
      }
      // console.log(decodeData);
      // if (arole1 != "users") {
      // } else {
      //   console.log(arole1);
      //   db.query(
      //     `select p.id,p.price,p.age,p.experience,p.isVerified,p.plan,u.id,u.email,u.phoneno,u.name,u.role,u.city,u.regDate from ${arole1} p right join users u on p.userId = u.id`,
      //     [decodeData.id],
      //     (err, result) => {
      //       if (err) {
      //         console.log(err);
      //       }
      //       console.log(result);
      //     }
      //   );
      // }
      res.send(decodeData);
    }
  } catch (error) {
    console.log(error);
  }
});

router.delete("/logout", (req, res) => {
  try {
    res.clearCookie("servicifyCookie", {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      path: "/",
      secure: true,
    });
    res.status(200).send("deleted");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
