import { useRef, useCallback, useEffect } from 'react';

export function useScrollElement({ offset } = {}) {
	const containerRef = useRef(null);
	const dataRef = useRef({
		isDrag: false,
		isChanged: false,
		startX: 0,
		scrollLeft: 0
	});

	const handleOnClick = event => {
		if (dataRef.current.isChanged) {
			event.stopPropagation();
		}

		dataRef.current.isChanged = false;
	};

	const handleOnMouseDown = event => {
		dataRef.current.isDrag = true;
		dataRef.current.startX = event.pageX - containerRef.current.offsetLeft;
		dataRef.current.scrollLeft = containerRef.current.scrollLeft;
		document.body.style.cursor = 'grabbing';
	};

	const handleOnMouseLeave = () => {
		dataRef.current.isChanged = false;
	};

	const handleOnMouseUp = () => {
		dataRef.current.isDrag = false;
		document.body.style.cursor = 'auto';
	};

	const handleOnMouseMove = event => {
		if (!dataRef.current.isDrag) {
			return;
		}

		event.preventDefault();

		const x = event.pageX - containerRef.current.offsetLeft;
		const delta = dataRef.current.scrollLeft - containerRef.current.scrollLeft;

		if (delta > 5 || delta < -5) {
			dataRef.current.isChanged = true;
		}

		containerRef.current.scrollLeft = dataRef.current.scrollLeft - (x - dataRef.current.startX);
	};

	useEffect(() => {
		const container = containerRef.current;

		container.style.overflow = 'hidden';

		container.addEventListener('click', handleOnClick);
		container.addEventListener('mousedown', handleOnMouseDown);
		container.addEventListener('mouseleave', handleOnMouseLeave);
		document.addEventListener('mouseup', handleOnMouseUp);
		document.addEventListener('mousemove', handleOnMouseMove);

		return () => {
			container.removeEventListener('click', handleOnClick);
			container.removeEventListener('mousedown', handleOnMouseDown);
			container.removeEventListener('mouseleave', handleOnMouseLeave);
			document.removeEventListener('mouseup', handleOnMouseUp);
			document.removeEventListener('mousemove', handleOnMouseMove);
		};
	}, []);

	const scrollPrev = useCallback(() => {
		containerRef.current.scrollTo({
			left: containerRef.current.scrollLeft - offset,
			behavior: 'smooth'
		});
	}, [offset]);

	const scrollNext = useCallback(() => {
		containerRef.current.scrollTo({
			left: containerRef.current.scrollLeft + offset,
			behavior: 'smooth'
		});
	}, [offset]);

	return {
		scrollPrev,
		scrollNext,
		containerRef
	};
}
