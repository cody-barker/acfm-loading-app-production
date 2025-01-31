class UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :role, :email
  has_many :loading_lists
end
