import express, { Request, Response } from "express";
import { userAuth } from "../middlewares/auth";
import { userModel as User, IUser } from "../models/user";
import {
  connectionReq,
  connectionRequestModel,
} from "../models/connectionRequest";

export const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName photoUrl about skills";

interface SafeData {
  firstName: string;
  lastName: string;
  photoUrl: string;
  about: string;
  skills: string[];
}

userRouter.get(
  "/connections",
  userAuth,
  async (req: Request, res: Response) => {
    try {
      const loggedUserId: string = req.body._id;
      const connections = await connectionRequestModel
        .find({
          $or: [
            {
              fromUserId: loggedUserId,
              reqStatus: "accepted",
            },
            {
              toUserId: loggedUserId,
              reqStatus: "accepted",
            },
          ],
        })
        // .populate("fromUserId toUserId", ["firstName", "lastName"]);;
        .populate("fromUserId", USER_SAFE_DATA) // mention the fields separated by spaces
        .populate("toUserId", USER_SAFE_DATA);

      const validConnections = await Promise.all(
        connections.map(async (c) => {
          const toUserId = JSON.parse(JSON.stringify(c.toUserId));
          const fromUserId = JSON.parse(JSON.stringify(c.fromUserId));

          // console.log({toUser:toUserId, fromUser:fromUserId})

          if (fromUserId && loggedUserId === fromUserId._id) {
            const u = await User.findById(toUserId);
            if (!Object.is(u, null)) {
              return c.toUserId;
            }
          } else if (toUserId && loggedUserId === toUserId._id) {
            const u = await User.findById(fromUserId);
            if (!Object.is(u, null)) {
              return c.fromUserId;
            }
          } else {
            return;
          }
        })
      );

      const goodConnections = validConnections.filter((c) => c);
      res.json({ connections, goodConnections });
    } catch (err) {
      res.status(400).json({ error: "Something went wrong", err });
    }
  }
);

userRouter.get("/requests/received", userAuth, async (req, res) => {
  const userEmail = req.body.email;
  try {
    const loggedUserId: string = req.body._id;

    // loggedinUser is toUser
    const reqs = await connectionRequestModel
      .find({
        toUserId: loggedUserId,
        reqStatus: "interested",
        // }).populate("fromUserId", ["firstName", "lastName", "photoUrl", "about", "skills"]);
      })
      .populate("fromUserId", USER_SAFE_DATA);

    const validReqs = await Promise.all(
      reqs.map(async (r) => {
        const fromUserId = JSON.parse(JSON.stringify(r.fromUserId));
        if (fromUserId) {
          const u = await User.findById(r.fromUserId);
          if (u) {
            return r;
          }
        }
      })
    );
    const goodReqs = validReqs.filter((r) => r);

    res.json({ reqs, goodReqs });
  } catch (err) {
    res.status(400).json({ error: "Something went wrong", err });
  }
});

// userRouter.get("/feed", userAuth, async (req: Request, res: Response) => {
//   try {
//     const user = req.body.user;
//     const loggedUserId: string = req.body._id;
//     const otherPersons = await User.find({ _id: { $ne: loggedUserId } }).select(
//       USER_SAFE_DATA
//     ); // $ne means not equal

//     const feed = await Promise.all(
//       otherPersons.map(async (p) => {
//         const pid = p._id;
//         const reqs = await connectionRequestModel.find({$or:[
//           {
//             fromUserId: pid,
//             toUserId: loggedUserId,
//             $or: [
//               { reqStatus: "accepted" },
//               { reqStatus: "rejected" },
//               { reqStatus: "ignored" },
//             ],
//           },
//           {
//             fromUserId: loggedUserId,
//             toUserId: pid,
//             $or: [
//               { reqStatus: "accepted" },
//               { reqStatus: "rejected" },
//             ],
//           }
//         ]});
//         const safePersonDetails: SafeData = {
//           firstName: p.firstName,
//           lastName: p.lastName,
//           photoUrl: p.photoUrl,
//           about: p.about,
//           skills: p.skills,
//         };
//         if (reqs.length === 0) {
//           return safePersonDetails;
//         }
//       })
//     );
//     const goodFeed = feed.filter((f) => {
//       if (!f) {
//         return false;
//       }
//       return true;
//     }); // To remove the null values

//     res.json({ goodFeed });
//   } catch (err) {
//     res.status(400).json({ error: "Something went wrong", err });
//   }
// });

userRouter.get("/feed", userAuth, async (req: Request, res: Response) => {
  try {
    const user = req.body.user;
    const loggedUserId: string = req.body._id;
    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50){
      limit = 50;
    }

    let hidePersons = new Set();

    const reqs = await connectionRequestModel
      .find({
        $or: [
          {
            toUserId: loggedUserId,
            $or: [{ reqStatus: "accepted" }, { reqStatus: "rejected" }],
          },
          {
            fromUserId: loggedUserId,
            $or: [
              { reqStatus: "accepted" },
              { reqStatus: "rejected" },
              { reqStatus: "ignored" },
            ],
          },
        ],
      })
      .select("fromUserId toUserId");
    // .populate("fromUserId", "firstName")
    // .populate("toUserId", "firstName");

    reqs.forEach((r) => {
      if (r.fromUserId.toString() == loggedUserId) {
        hidePersons.add(r.toUserId);
      } else if (r.toUserId.toString() == loggedUserId) {
        hidePersons.add(r.fromUserId);
      }
    });

    const goodFeed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hidePersons) } },
        { _id: { $ne: loggedUserId } },
      ],
    }).select(USER_SAFE_DATA).skip((page-1)*limit).limit(limit);
    res.json({ goodFeed });

  } catch (err) {
    res.status(400).json({ error: "Something went wrong", err });
  }
});