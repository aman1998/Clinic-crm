import React from 'react';
import { useParams } from 'react-router';
import { useMutation } from 'react-query';
import { Controller, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';
import FuseLoading from '@fuse/core/FuseLoading';
import { AttachFile as AttachFileIcon } from '@material-ui/icons';
import { TextField, MenuItem, Button } from 'app/bizKITUi';
import { leadsServices } from 'app/services/leads';
import { useAlert } from 'app/hooks';
import { Message } from '../Message/Message';

const useStyles = makeStyles(() => ({
	date: {
		margin: '16px auto',
		padding: '4px 0',
		backgroundColor: '#DBDEE1',
		borderRadius: 12,
		width: 100
	},
	messageGroup: {
		padding: '20px 26px',
		backgroundColor: '#F7F7F7',
		borderRadius: 4,
		border: '1px solid rgba(181, 181, 181, 0.5)',
		marginTop: 70
	},
	noBorder: {
		border: 'none'
	},
	addFile: {
		fontSize: 12,
		color: '#202020'
	}
}));

const initialValues = {
	deadline: 'oneDay',
	date: 'everytime',
	phones: []
};

export function RightSide({ setIsModalLeadOpen, comments, isCommentLoading }) {
	const classes = useStyles();
	const { leadUuid } = useParams();
	const { alertError } = useAlert();

	const { control, errors, getValues } = useForm({
		mode: 'onBlur',
		defaultValues: { ...initialValues }
	});

	const createMessage = useMutation(({ uuid, payload }) => leadsServices.createComment(uuid, payload));
	const sendMessage = () => {
		const payload = {
			text: getValues().comment
		};
		createMessage.mutateAsync({ uuid: leadUuid, payload }).catch(() => {
			alertError('Не удалось отправить комментарий');
		});
	};

	return (
		<div className=" hidden sm:block py-8 px-24 w-full mb-24">
			<div className="flex justify-between w-full">
				<Controller
					as={<TextField className="w-160" size="small" />}
					control={control}
					variant="outlined"
					name="date"
					select
					error={!!errors.date}
					helperText={errors.date?.message}
				>
					<MenuItem value="everytime">За все время</MenuItem>
				</Controller>

				<Button
					variant="contained"
					color="primary"
					className="px-32 h-40"
					textNormal
					// disabled={createPatient.isLoading || updatePatient.isLoading}
					onClick={() => setIsModalLeadOpen(true)}
				>
					Добавить задачу
				</Button>
			</div>
			<div className="mt-6">
				<div className="my-10 mx-auto">
					<div className={`${classes.date} text-center`}>30 авгусе</div>
				</div>
				<div className="overflow-y-scroll max-h-216">
					{isCommentLoading ? (
						<FuseLoading />
					) : (
						comments?.map(comment => (
							<Message key={comment.uuid} text={comment.description} createdDate={comment.created_at} />
						))
					)}
				</div>
				<div className={`${classes.messageGroup}`}>
					<div className="text-dark-blue">Комментарии: </div>
					<Controller
						as={
							<TextField
								placeholder="Написать комментарий"
								InputProps={{
									classes: { notchedOutline: classes.noBorder }
								}}
							/>
						}
						control={control}
						variant="outlined"
						fullWidth
						multiline
						className="mb-20"
						name="comment"
						error={!!errors.comment}
						helperText={errors.comment?.message}
					/>
					<div className="flex justify-between items-center">
						<div>
							<Button
								onClick={sendMessage}
								className="mr-20"
								variant="contained"
								color="primary"
								textNormal
							>
								Добавить
							</Button>
							<Button variant="text" textNormal>
								Отменить
							</Button>
						</div>
						<div className={classes.addFile}>
							<AttachFileIcon className="text-grey-500" /> Добавить файл
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

RightSide.propTypes = {
	setIsModalLeadOpen: PropTypes.func,
	comments: PropTypes.arrayOf(),
	isCommentLoading: PropTypes.bool
};

RightSide.defaultProps = {
	isCommentLoading: false,
	comments: [],
	setIsModalLeadOpen: () => {}
};
