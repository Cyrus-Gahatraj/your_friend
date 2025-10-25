const BaseModal = ({
    open, onClose, children
}) => {

    return (
      <div
        onClick={onClose}
        className={`fixed inset-0 flex justify-center items-center transition-colors ${
          open ? "visible bg-black/20" : "invisible"
        }
    `}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-white px-22 py-15  rounded-xl"
        >
          {children}
        </div>
      </div>
    );
}

export default BaseModal;