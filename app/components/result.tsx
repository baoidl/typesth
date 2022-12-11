import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { SHORTCUTS, STATE_IDLE, TIMER_15 } from '~/constant';
import { plural } from '~/helpers/plural';
import useStore from '~/store';
import { getShortcut } from '~/helpers/keys';

type TestResultProps = {
	className?: string;
	data?: {
		words: string[];
		typed: string[];
		timeTyped: number;
	};
	options?: {
		timer: number;
	};
};
const Result = forwardRef<HTMLDivElement, TestResultProps>(
	(
		{
			className = '',
			data = {
				words: [],
				typed: [],
				timeTyped: 30,
			},
			options = { timer: TIMER_15 },
		}: TestResultProps,
		ref,
	) => {
		const updateState = useStore(state => state.updateState);
		const [showCPM, setShowCPM] = useState(false);

		const toggleCPM = () => {
			setShowCPM(!showCPM);
		};

		const handleKeyDown = useCallback(
			(e: KeyboardEvent) => {
				e.preventDefault();
				const shortcut = getShortcut(e);
				if (!shortcut) return;
				switch (shortcut) {
					case SHORTCUTS.restart:
						updateState(STATE_IDLE);
						break;
					default:
						break;
				}
			},
			[updateState],
		);

		const attachEventListeners = useCallback(() => {
			document.addEventListener('keydown', handleKeyDown);
		}, [handleKeyDown]);

		const removeEventListeners = useCallback(() => {
			document.removeEventListener('keydown', handleKeyDown);
		}, [handleKeyDown]);

		useEffect(() => {
			attachEventListeners();
			return () => {
				removeEventListeners();
			};
		}, [attachEventListeners, removeEventListeners]);

		const calculateAccuracy = useCallback(() => {
			const { words, typed } = data;
			let errors = 0;
			for (let i = 0; i < typed.length; i++) {
				if (!words[i]) {
					errors++;
					return;
				}
				if (typed[i] !== words[i]) {
					for (let j = 0; j < typed[i].length; j++) {
						if (typed[i][j] !== words[i][j]) {
							errors++;
						}
					}
				}
			}
			const typedString = typed.join(' ');
			let correctCharacters = typedString.length - errors;
			return Math.floor((correctCharacters / typedString.length) * 100) / 100;
		}, [data]);

		const calculate = useCallback(() => {
			const { typed, timeTyped } = data;
			const typedString = typed.join(' ');
			const cpm = Math.round((typedString.length / data.timeTyped) * 60);
			const wpm = Math.round((typedString.length / 5 / data?.timeTyped) * 60);
			const accuracy = calculateAccuracy() || 0;
			return { cpm, wpm, accuracy, timeTyped };
		}, [calculateAccuracy, data]);

		const { cpm, wpm, accuracy } = calculate();
		const typedWordsCount = data.typed.length;
		return (
			<div ref={ref} className={clsx('p-2 text-center', className)}>
				<div className="stats grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1">
					<div className="stat">
						<div className="stat-title mb-4 text-2xl md:text-3xl lg:text-4xl">
							accuracy
						</div>
						<div className="stat-value text-2xl md:text-3xl lg:text-5xl mb-4">
							{accuracy * 100}%
						</div>
					</div>
					<div className="stat" onClick={toggleCPM}>
						<div className="stat-title mb-4 text-2xl md:text-3xl lg:text-4xl">
							{showCPM ? 'cpm' : 'wpm'}
						</div>
						<div className="stat-value text-2xl md:text-3xl lg:text-5xl mb-4">
							{showCPM ? cpm : wpm}
						</div>
					</div>
					<div className="stat">
						<div className="stat-title mb-4 text-2xl md:text-3xl lg:text-4xl">
							you typed
						</div>
						<div className="stat-value flex flex-col text-2xl md:text-3xl lg:text-5xl mb-4">
							<span>
								{typedWordsCount} {plural('word', typedWordsCount)}
							</span>
						</div>
					</div>
				</div>
			</div>
		);
	},
);

Result.displayName = 'TestResult';
export default Result;
