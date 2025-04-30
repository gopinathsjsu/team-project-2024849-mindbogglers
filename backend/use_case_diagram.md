usecaseDiagram
  actor Customer
  actor PrintingAgent
  actor Administrator
  
  Customer -- (Create Account)
  Customer -- (Place Order)
  Customer -- (Provide PDF File)
  
  PrintingAgent -- (Inspect PDF Files)
  
  Administrator -- (Monitor Stock)
  Administrator -- (Place Order at Supplier)
  
  (Create Account) .> (Provide Address and Credit Card) : includes
  (Place Order) .> (Select Product Type) : includes
  (Place Order) .> (Select Quantity) : includes
  (Place Order) .> (Select Paper Type) : includes
  (Place Order) .> (Choose Cover Type) : extends
  (Place Order) .> (Provide PDF File) : includes
  (Place Order) .> (Provide Account Information) : includes
  (Place Order) .> (Check Required Information) : includes
  (Place Order) .> (Finalize Order) : includes
  (Finalize Order) .> (Send Credit Card Information to Bank) : includes
  (Finalize Order) .> (Get Bank Approval) : includes
  
  (Inspect PDF Files) .> (Inform Customer about Quality Issues) : extends
  (Monitor Stock) .> (Place Order at Supplier) : extends