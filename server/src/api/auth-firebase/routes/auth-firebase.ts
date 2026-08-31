export default {
   routes: [
      {
         method: "POST",
         path: "/auth-firebase",
         handler: "auth-firebase.authenticate",
         config: {
            auth: false, // Disables authentication for this endpoint
            policies: [],
            middlewares: [],
         },
      },
   ],
};
