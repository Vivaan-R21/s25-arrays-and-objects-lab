"use strict";
const salesTaxRateInCalifornia = 7.25;

let catalogue = [];
let cart = [];

fetch("./catalogue.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    addCatalogueItemsToMenu(data);
    // Populate the catalogue array
    data.forEach((item) => catalogue.push(item));
  })
  .catch((error) => console.error("Unable to fetch data:", error));

const checkoutBtn = document.getElementById("checkout-btn");
checkoutBtn.addEventListener("click", checkout);

function addCatalogueItemsToMenu(catalogue) {
  // Create a variable named menuItems that will get an element in our HTML document with the ID of "menu-items".
  const menuItems = document.getElementById("menu-items");
  
  // Create an array from the input parameter, catalogue, using the Array.from function.
  Array.from(catalogue)
    // createShopItem is a function that returns an HTML element from an object in catalogue.json.
    // Chain a call to .map, mapping each item in the catalogue to a call to createShopItem.
    .map((item) => createShopItem(item))
    // Chain a call to .forEach. forEach is a function that applies one or multiple operations to each element, one at a time.
    // For each element in our output from calling .map, use the .appendChild method on menuItems to append the current element to the document.
    .forEach((item) => menuItems.appendChild(item));
}

function createShopItem(itemObject) {
  const shopItemCard = document.createElement("div");
  shopItemCard.id = `item-${itemObject.id}`;
  shopItemCard.classList.add("card");

  // The image of the item on the card
  const cardImage = document.createElement("img");
  cardImage.src = itemObject.imgUrl;
  cardImage.alt = itemObject.description;
  cardImage.classList.add("card-img-top", "mt-2");

  // The body of the card item
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  // The title and price of the card item
  const cardTitleAndPrice = document.createElement("span");
  cardTitleAndPrice.classList.add("card-title");

  const cardTitle = document.createElement("strong");
  cardTitle.id = `item-title-${itemObject.id}`;

  // Access the object's "name" property to display the correct name of the item.
  cardTitle.innerText = `${itemObject.name} • `;

  const cardPrice = document.createElement("span");
  cardPrice.id = `item-price-${itemObject.id}`;

  // Access the object’s price property to display the correct price of the item.
  // Use the .toFixed(2) function to fix the decimal precision to two decimal places.
  cardPrice.innerText = `$${itemObject.price.toFixed(2)}`;

  cardTitleAndPrice.appendChild(cardTitle);
  cardTitleAndPrice.appendChild(cardPrice);

  // The description of the card item
  const cardDescription = document.createElement("p");
  cardDescription.innerText = itemObject.description;
  cardDescription.classList.add("card-text");

  const addOrRemoveFromCartBtns = document.createElement("div");
  addOrRemoveFromCartBtns.classList.add(
    "row",
    "gap-2",
    "text-center",
    "justify-content-center"
  );

  // Button to remove an item from the cart
  const removeFromCartBtn = document.createElement("a");
  removeFromCartBtn.classList.add(
    "btn",
    "btn-outline-danger",
    "col-1",
    "p-0",
    "py-2"
  );
  removeFromCartBtn.innerText = "-";
  // Text with the amount of this item in the cart
  const amountLabel = document.createElement("h5");
  amountLabel.id = `amt-${itemObject.id}`;
  amountLabel.classList.add("inline-block", "col-3", "pt-2");
  amountLabel.innerText = "0";
  // Button to add the item to the cart
  const addToCartBtn = document.createElement("a");
  addToCartBtn.classList.add("btn", "btn-danger", "col-1", "p-0", "py-2");
  addToCartBtn.innerText = "+";

  addOrRemoveFromCartBtns.appendChild(removeFromCartBtn);
  addOrRemoveFromCartBtns.appendChild(amountLabel);
  addOrRemoveFromCartBtns.appendChild(addToCartBtn);

  addToCartBtn.addEventListener("click", function () {
    addItemToCart(itemObject);
    updateCheckoutBtn();
    updateItemAmountLabel(itemObject.id);
  });

  removeFromCartBtn.addEventListener("click", function () {
    removeItemFromCart(itemObject.id);
    updateCheckoutBtn();
    updateItemAmountLabel(itemObject.id);
  });

  cardBody.appendChild(cardTitleAndPrice);
  cardBody.appendChild(cardDescription);
  cardBody.appendChild(addOrRemoveFromCartBtns);
  shopItemCard.appendChild(cardImage);
  shopItemCard.appendChild(cardBody);

  return shopItemCard;
}

function updateCheckoutBtn() {
  const totalItemsInCart = cart
    .map((item) => item.amount)
    .reduce((acc, amount) => acc + amount, 0);

  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.innerText = `Checkout (${totalItemsInCart})`;
  if (cart.length === 0) {
    checkoutBtn.classList.add("btn-outline-danger");
    checkoutBtn.classList.remove("btn-danger");
  } else {
    checkoutBtn.classList.add("btn-danger");
    checkoutBtn.classList.remove("btn-outline-danger");
  }
}

function addItemToCart(itemObject) {
  // Create a for-loop to iterate the same amount of times as there are elements in our cart.
  for (let i = 0; i < cart.length; i++) {
    // Inside the for-loop we must check if the current element’s (the ith element) id property is equal to the itemObject’s id property.
    if (cart[i].id === itemObject.id) {
      // If the ids match, then we must increment the current element’s amount property by 1 and return.
      cart[i].amount++;
      return;
    }
  }
  // Outside the for-loop we must push the object to the cart.
  cart.push({ id: itemObject.id, amount: 1 });
}

function removeItemFromCart(id) {
  const item = cart.find((item) => item.id === id);
  if (item === undefined) {
    return;
  }

  const position = cart.indexOf(item);
  cart[position].amount--;

  if (cart[position].amount <= 0) {
    cart.splice(position, 1);
  }
}

function updateItemAmountLabel(id) {
  const amountLabel = document.getElementById(`amt-${id}`);

  const item = cart.find((item) => item.id === id);
  if (item === undefined) {
    amountLabel.innerText = "0";
    return;
  }

  amountLabel.innerText = `${item.amount}`;
}

function removeAllItemsFromCart() {
  cart = [];

  catalogue.map((item) => item.id).forEach((id) => updateItemAmountLabel(id));

  updateCheckoutBtn();
}

function checkout() {
  const checkoutBodyElem = document.getElementById("checkout-body");

  // Display a message to alert the user that their cart is empty, only if the cart is empty.
  if (cart.length === 0) {
    const message = "Your cart is empty.";
    checkoutBodyElem.innerHTML = message;
    return;
  }

  checkoutBodyElem.innerHTML += "<hr>";

  const checkoutItemsElem = document.createElement("div");
  checkoutItemsElem.id = "checkout-items";

  let total = 0;

  // List the name, price, and amount of each item in the cart
  cart.forEach((cartEntry) => {
    const item = catalogue.find((item) => item.id === cartEntry.id);

    const row = document.createElement("div");
    row.id = `checkout-item-${cartEntry.id}`;
    row.classList.add("row");

    const itemName = document.createElement("p");
    itemName.classList.add("inline-block", "col");
    itemName.innerText = item.name;

    const itemPrice = document.createElement("p");
    itemPrice.classList.add("inline-block", "col-3");

    itemPrice.innerHTML = `$${item.price.toFixed(2)}`;
    itemPrice.innerHTML += cartEntry.amount > 1 ? ` x${cartEntry.amount}` : "";

    row.appendChild(itemName);
    row.appendChild(itemPrice);
    checkoutItemsElem.appendChild(row);

    total += item.price * cartEntry.amount;
  });

  // Calculate and create the subtotal, tax total, and total elements
  const subtotal = total;
  const taxTotal = subtotal / salesTaxRateInCalifornia;
  total += taxTotal;

  const pricesRow = document.createElement("div");
  pricesRow.classList.add("row");

  const subtotalLabel = document.createElement("p");
  subtotalLabel.classList.add("inline-block", "col-12", "text-start");
  subtotalLabel.innerText = `Subtotal: $${subtotal.toFixed(2)}`;

  const taxLabel = document.createElement("p");
  taxLabel.classList.add("inline-block", "col-12", "text-start");
  taxLabel.innerText = `Tax: $${taxTotal.toFixed(2)}`;

  const totalLabel = document.createElement("p");
  totalLabel.classList.add("inline-block", "col-12", "text-start");
  totalLabel.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;

  pricesRow.appendChild(subtotalLabel);
  pricesRow.appendChild(taxLabel);
  pricesRow.appendChild(totalLabel);
  checkoutItemsElem.appendChild(pricesRow);

  // Create the Place Order button
  const placeOrderBtnRow = document.createElement("div");
  placeOrderBtnRow.classList.add("row");

  const placeOrderBtn = document.createElement("a");
  placeOrderBtn.id = "place-order-btn";
  placeOrderBtn.classList.add("btn", "btn-danger", "col", "mx-2");
  placeOrderBtn.innerText = "Place Order";
  placeOrderBtn.addEventListener("click", function () {
    removeAllItemsFromCart();
    checkout();
    placeOrder();
  });

  placeOrderBtnRow.appendChild(placeOrderBtn);
  checkoutBodyElem.appendChild(checkoutItemsElem);
  checkoutBodyElem.appendChild(placeOrderBtnRow);
}

function placeOrder() {
  const alertPlaceholder = document.getElementById("order-placed-alert");
  const wrapper = document.createElement("div");

  wrapper.innerHTML = [
    `<div class="alert alert-success alert-dismissible m-3" role="alert">`,
    `   <div>Order placed, thank you!</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertPlaceholder.append(wrapper);
}
