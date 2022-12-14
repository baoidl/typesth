import React from 'react';
import useStore from '~/store';
import {
	STATE_FINISHED,
	STATE_IDLE,
	STATE_PAUSED,
	STATE_RUNNING,
} from '~/constant';
import Header from '~/components/header';
import Footer from '~/components/footer';
import Tester from '~/components/tester';
import KBDHint from '~/components/kbd_hint';
import Result from '~/components/result';
import Settings from '~/components/settings';
import Transition from '~/components/transition';
import englishWords from '~/data/english.json';
import { getRandomWordList } from '~/helpers/random';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async () => {
	return json({
		words: getRandomWordList(englishWords.data, 200),
	});
};

const Index = () => {
	const { words } = useLoaderData();
	const { state, settings, result } = useStore(state => state);
	const hints = [
		{
			label: 'restart',
			keys: ['ctrl', 'enter'],
		},
	];

	return (
		<main className="h-screen w-screen bg-base-100 grid grid-rows-[auto_1fr_56px] md:grid-rows-[96px_1fr_56px]">
			<Header
				right={
					<Transition show={state !== STATE_RUNNING}>
						<Settings />
					</Transition>
				}
			/>
			<section className="container max-w-screen-2xl h-full grid grid-rows-[4fr_120px] md:grid-rows-[8fr_120px] md:pt-[80px] items-center m-auto px-4 md:px-16 lg:px-24">
				{state === STATE_IDLE ||
				state === STATE_RUNNING ||
				state === STATE_PAUSED ? (
					<Transition show appear>
						<Tester
							words={words}
							options={{
								fontSize: 56,
								timer: settings.timer,
								showLines: 3,
								extraLimit: 10,
							}}
						/>
					</Transition>
				) : (
					<Transition show appear>
						<Result
							data={result}
							options={{
								timer: settings.timer,
							}}
						/>
					</Transition>
				)}
				<Transition show={state === STATE_RUNNING || state === STATE_FINISHED}>
					<KBDHint hints={hints} />
				</Transition>
			</section>
			<Transition show={state !== STATE_RUNNING}>
				<Footer />
			</Transition>
		</main>
	);
};
export default Index;
