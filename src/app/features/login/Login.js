import FuseAnimate from '@fuse/core/FuseAnimate';
import { useForm } from '@fuse/hooks';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';
import { submitLogin } from 'app/auth/store/actions';
import store from 'app/store';

const useStyles = makeStyles(theme => ({
	root: {
		background: `#f0f0f0`,
		color: theme.palette.primary.contrastText
	}
}));

function LoginPage() {
	const classes = useStyles();

	const { form, handleChange } = useForm({
		email: '',
		password: '',
		remember: true
	});

	function isFormValid() {
		return form.email.length > 0 && form.password.length > 0;
	}

	function handleSubmit(ev) {
		const authData = {
			email: form.email,
			password: form.password
		};
		ev.preventDefault();
		store.dispatch(submitLogin(authData));
	}

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="w-full max-w-384">
						<CardContent className="flex flex-col items-center justify-center p-32">
							<img className="w-128 m-32" src="assets/images/logos/logo-icon.svg" alt="logo" />

							<Typography variant="h6" className="mt-16 ">
								Aibomed
							</Typography>
							<Typography className="mt-10 mb-20 text-center">
								Система операционно-учетного управления клиникой
							</Typography>
							<form
								name="loginForm"
								noValidate
								className="flex flex-col justify-center w-full"
								onSubmit={handleSubmit}
							>
								<TextField
									className="mb-16"
									label="Email"
									autoFocus
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									variant="outlined"
									required
									fullWidth
								/>

								<TextField
									className="mb-16"
									label="Пароль"
									type="password"
									name="password"
									value={form.password}
									onChange={handleChange}
									variant="outlined"
									required
									fullWidth
								/>

								<div className="flex items-center justify-between">
									<FormControl>
										<FormControlLabel
											control={
												<Checkbox
													name="remember"
													checked={form.remember}
													onChange={handleChange}
												/>
											}
											label="Запомнить меня"
										/>
									</FormControl>

									<Link className="font-medium" to="/pages/auth/forgot-password">
										Забыли пароль?
									</Link>
								</div>

								<Button
									variant="contained"
									color="primary"
									className="w-224 mx-auto mt-16"
									aria-label="LOG IN"
									disabled={!isFormValid()}
									type="submit"
								>
									Войти
								</Button>
							</form>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default LoginPage;
