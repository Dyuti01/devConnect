# DevTinder APIs

### authRouter
- POST /signup
- POST /login
- POST /logout

### profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

### connectionRequestRouter
- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId
- POST /request/send/:fromUserId/:toUserId

### userRouter
- GET /user/connections
- GET /requests/received
- GET /feed - Gets you the profiles of other profiles

`Status: igonre, interested, accepted, rejected`

## Pagination
/feed?page=1&limit=10    ---> .skip(0) & .limit(10)  // 1-10
/feed?page=2&limit=10    ---> .skip(10) & .limit(10)  // 11-20
/feed?page=3&limit=10    ---> .skip(20) & .limit(10)  // 21-30

.skip() & .limit()

skipArg = (page-1)*req.params.limit