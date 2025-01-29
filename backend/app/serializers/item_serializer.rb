class ItemSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :quantity
  has_many :loading_list_items
end
