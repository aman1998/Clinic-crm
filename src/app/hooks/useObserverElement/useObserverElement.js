import React, { useRef, useEffect, useCallback } from 'react';

export function useObserverElement(callback) {
	const elementRef = useRef();
	const callbackRef = useRef(callback);
	const observerRef = useRef();

	const Element = useCallback(() => <div ref={elementRef} />, []);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		observerRef.current = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				callbackRef.current();
			}
		});
	}, []);

	useEffect(() => {
		if (elementRef.current) {
			observerRef.current.observe(elementRef.current);
		}

		return () => observerRef.current.disconnect();
	});

	return Element;
}
