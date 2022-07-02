// class UnauthorizedError extends Error {
//   inner: {
//     message: string;
//   };
//   data: {
//     message: string;
//     code: string;
//     type: 'UnauthorizedError';
//   };
//   constructor(code: string, error: { message: string }){
//       super(error.message);
//       this.name = 'UnauthorizedError';
//       this.inner = error;
//       this.data = {
//           message: this.message,
//           code,
//           type: 'UnauthorizedError'
//       };
//       Object.setPrototypeOf(this, UnauthorizedError.prototype);
//   }
// }

export const isUnauthorizedError = (error: any)=>{
  return error.data?.type === 'UnauthorizedError';
};
