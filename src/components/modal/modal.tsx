import { ReactNode } from "react";
import "./modal.scss";

type Props = {
  onOk: () => void;
  okText: string;
  onCancel?: () => void;
  cancelText?: string;
  title?: string;
  children?: ReactNode;
};

export default function Modal(_: Props) {
  return (
    <div className="modal flex items-center justify-center">
      <div className="modal__container">
        <div className="modal__header flex justify-center">
          <h1 className="text-2xl font-bold">{_.title || "Title"}</h1>
        </div>
        <div className="modal__body flex justify-center mb-4">{_.children}</div>
        <div className="modal__footer flex justify-center gap-x-4">
          <button className="btn modal__btn" onClick={_.onOk}>
            {_.okText || "OK"}
          </button>
          {_.onCancel && (
            <button className="btn modal__btn" onClick={_.onCancel}>
              {_.cancelText || "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
