# Project overview

### Too many hooks
We are stuck with a problem that there are a lot of hooks, like `useUser`, `useDoctor`, `useUsers`, `useDoctorSchedule`, `useDoctorReceptions`, and so on... and so on.

That might look like a good solution the first time, but in the long term, it is not very useful. These hooks start to have different interfaces, different logic it is starting to be hurt to maintain. When there is more than one developer it might also be difficult to spread knowledge about existing hooks, and hard to keep it consistent.

So we are decided that should use as much as possible default hooks and libraries instead of tons of wrappers.
It is better to have commonly used hooks, but not special hooks for special situations.

### Get rid of Redux
We are heading towards getting rid of `redux`. For most cases [react-query](https://react-query.tanstack.com) is better solution. Also, there could be some cases when we actually need **global state** I totally believe that all of these cases might be solved with using `React.Context`.

But it is a long-term plan, we are not trying to do it as soon as possible, but somewhere in the future.

### React Query
We are using [react-query](https://react-query.tanstack.com) lib for fetching data.

`ENTITY` - is some entity like `User`, `Patient`, etc. We are using `ENTITY` as a `queryKey` for react-query, ex:
```jsx
// Single user
const { isLoading, isError, data } = useQuery([ENTITY.USER, uuid], () => authService.getUser(uuid));

// list of users
const { isLoading, isError, data } = useQuery(
    [ENTITY.USER, { limit: 10, offset: 0, group: 'admin' }],
    ({ queryKey }) => authService.getUsersList(queryKey[1])
);
```

For data invalidation we are using `ENTITY_DEPS` it looks like:
```jsx
ENTITY_DEPS.USER.forEach(dep => {
  queryClient.invalidateQueries(dep);
})
```
That invalidates all queries that `queryKey` starts from `ENTITY.USER` and all dependent queries which specified as array in `ENTITY_DEPS`.

### useEffect dependencies
All dependencies of `useEffect` must be correctly specified.
Using of hooks `useMount`, `useUpdateEffect`, and so on is deprecated and should not appear in new code, and be refactored in legacy code.

For now, we have a lot of wrong code with `useMount` and `useUpdateEffect` where missed some dependencies. You should not use such code as an example to solve your problems.

> An infinite loop may also happen if you specify a value that always changes in the dependency array. You can tell which one by removing them one by one. However, removing a dependency you use (or blindly specifying []) is usually the wrong fix.
>
> Dan Abramov

Instead, there are some methods of decoupling. We would recommend you to read this article [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)

**So remember - ALL dependencies MUST be correctly specified.**

---

## Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `yarn run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `yarn run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
