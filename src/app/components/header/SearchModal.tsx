"use client";

import { Modal, ModalHeader, ModalBody } from "flowbite-react";
import SearchBar from "@/app/components/header/Search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  return (
    <Modal show={isOpen} size="md" popup onClose={onClose}>
      <ModalHeader className="px-6">
        <div className="flex justify-between items-center w-full">
          <span className="text-xl text-cyan-shadow">Search</span>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="text-center">
          <SearchBar />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
