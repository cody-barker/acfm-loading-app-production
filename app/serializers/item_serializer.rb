class ItemSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :quantity, :repair_quantity
  # has_many :loading_list_items
end
