import Pause from "/pause.svg";
import Play from "/play.svg";
import Reload from "/reload.svg";

type Props = {
  isPlaying: boolean;
  onTogglePlaying: () => void;
  onRestart: () => void;
  score: number;
};

export default function Score(_: Props) {
  return (
    <div className="board__score basis-[10%] border-b-2 border-solid border-white flex items-center justify-between px-2">
      <div className="w-[12%] flex items-center">
        <button
          className="btn w-full aspect-square !p-[10%]"
          onClick={_.onTogglePlaying}
        >
          <img
            src={_.isPlaying ? Pause : Play}
            alt="control"
            className="h-full w-full object-contain"
          />
        </button>
      </div>
      <div className="text-white bg-purple-400 text-xl font-bold w-2/5 flex justify-center rounded-md py-[2%] border-2 border-white border-solid">
        {_.score}
      </div>
      <div className="w-[12%] flex items-center">
        <button
          className="btn w-full aspect-square !p-[10%]"
          onClick={_.onRestart}
        >
          <img
            src={Reload}
            alt="control"
            className="h-full w-full object-contain"
          />
        </button>
      </div>
    </div>
  );
}
