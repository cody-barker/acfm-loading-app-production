class TeamSerializer < ActiveModel::Serializer
  attributes :id, :name
  has_many :loading_lists
end
