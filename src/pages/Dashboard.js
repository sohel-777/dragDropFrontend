import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({
    title: "",
    createdBy: "",
    description: "",
    file: null,
  });
  const [updatedCardData, setUpdatedCardData] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  //get all cards
  const loadCards = async () => {
    try {
      const response = await axios.get(
        "https://dragdropapp-backend.onrender.com/card/get-all-cards",
        {
          headers: { "x-acciojob": localStorage.getItem("token") },
        }
      );
      // console.log(response.data)
      setCards(response.data);
    } catch (error) {
      console.error("Error loading cards:", error);
    }
  };
//func for add card
  const handleCreateCard = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newCard.title);
      formData.append("description", newCard.description);
      formData.append("file", newCard.file);
      console.log(formData);

      await axios.post("https://dragdropapp-backend.onrender.com/card/create-card", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-acciojob": localStorage.getItem("token"),
        },
      });
      cardAddedToast();
      setNewCard({ title: "", createdBy: "", description: "", file: null });
      loadCards();
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };
//for edit card
  const handleEditCard = async (cardId) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedCardData.title);
      formData.append("description", updatedCardData.description);
      formData.append("file", updatedCardData.file);

      await axios.patch(
        `https://dragdropapp-backend.onrender.com/card/edit-card/${cardId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-acciojob": localStorage.getItem("token"),
          },
        }
      );
      cardEditedToast();
      setIsEdit(false)
      setUpdatedCardData({ title: "", description: "", file: null });
      loadCards();
    } catch (error) {
      console.error("Error editing card:", error);
    }
  };
//for delete
  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`https://dragdropapp-backend.onrender.com/card/delete-card/${cardId}`, {
        headers: { "x-acciojob": localStorage.getItem("token") },
      });
      cardDeletedToast();
      loadCards();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);
//for managing the drag order
  const onDragEnd = (result) => {
    console.log(result);
    if (!result.destination) {
      return;
    }

    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order of the cards based on the drag-and-drop result
    // Send the new order to API to persist it
    const newCardOrder = items.map((card, index) => ({
      _id: card._id, // Assuming _id is the card's unique identifier
      order: index,
    }));

    axios
      .patch("https://dragdropapp-backend.onrender.com/card/update-card-order", {
        updatedCardsOrder: newCardOrder,
      })
      .then((response) => {
        console.log(response.data.message);
        cardOrderToast();
      })
      .catch((error) => {
        console.error("Error updating card order:", error);
      });

    setCards(items);
  };
  const handleLogout =()=>{
    localStorage.removeItem('token')
    window.location.href="/login"
  }

  //toast msg
  const cardOrderToast = () => toast("Card order updated successfully!");
  const cardAddedToast = () => toast("Card added successfully!");
  const cardEditedToast = () => toast("Card edited successfully!");
  const cardDeletedToast = () => toast("Card deleted successfully!");

  return (
    <div className="container mt-4">
      <div className="heading ">
        <div className="col"><h1>Dashboard</h1></div>
        
          <button className=" col  logout-btn" onClick={handleLogout}>Logout</button>
        
      </div>
      
      <div className="mb-3">
        <h2>Create a New Card</h2>
        <div className="row">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={newCard.title}
              onChange={(e) =>
                setNewCard({ ...newCard, title: e.target.value })
              }
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={newCard.description}
              onChange={(e) =>
                setNewCard({ ...newCard, description: e.target.value })
              }
            />
          </div>
          <div className="col">
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setNewCard({ ...newCard, file: e.target.files[0] })
              }
            />
          </div>
          <div className="col">
            <button className="btn btn-primary" onClick={handleCreateCard}>
              Create
            </button>
          </div>
        </div>
      </div>
      <div>
        <h2>Existing Cards</h2>
        <ToastContainer />
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cards">
            {(provided) => (
              <ul
                className="list-group "
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {cards.map((card, index) => (
                  <Draggable
                    key={card._id}
                    draggableId={card._id}
                    index={index}
                  >
                    {(provided) => (
                      <li
                        className="list-group-item  px-5 py-3 border border-primary"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="row">
                          <div className="col">
                            <h3>Title: {card.title}</h3>
                          </div>
                          <div className="col">
                            <p>CreatedBy: {card.createdBy}</p>
                          </div>

                          <p>Description: {card.description}</p>
                        </div>
                        <div className="row my-1 ">
                          {card.attachments.map((attachment) => (
                            <a
                              key={attachment.file}
                              href={attachment.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="row  "
                            >
                              {attachment.originalName}
                            </a>
                          ))}
                        </div>

                        {isEdit && (
                          <>
                            <input
                              type="text"
                              className="form-control my-1"
                              placeholder={card.title}
                              value={updatedCardData.title}
                              onChange={(e) =>
                                setUpdatedCardData({
                                  ...updatedCardData,
                                  title: e.target.value,
                                })
                              }
                            />
                            <input
                              type="text"
                              className="form-control my-1"
                              placeholder={card.description}
                              value={updatedCardData.description}
                              onChange={(e) =>
                                setUpdatedCardData({
                                  ...updatedCardData,
                                  description: e.target.value,
                                })
                              }
                            />
                            <input
                              type="file"
                              className="form-control my-1"
                              onChange={(e) =>
                                setUpdatedCardData({
                                  ...updatedCardData,
                                  file: e.target.files[0],
                                })
                              }
                            />
                            <button
                              className="btn btn-success mx-2 my-2"
                              onClick={() => handleEditCard(card._id)}
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <div>
                          <button
                            className="btn btn-info mx-2 my-2"
                            onClick={() => setIsEdit(!isEdit)}
                          >
                            {isEdit ? "Cancel" : "Edit"}
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteCard(card._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Dashboard;
