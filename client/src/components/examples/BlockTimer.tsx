import BlockTimer from '../BlockTimer';

export default function BlockTimerExample() {
  return (
    <BlockTimer onBlockMined={() => console.log('Block mined!')} />
  );
}
